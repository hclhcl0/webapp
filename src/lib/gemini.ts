// @ts-nocheck
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { getPayload } from 'payload';
import configPromise from '@payload-config';

let knowledgeBaseCache: any = null;
let knowledgeCacheTime = 0;
const KNOWLEDGE_CACHE_TTL = 15 * 60 * 1000; // 15 phút (và tự động xóa tức thì qua hook khi Admin lưu)

const keyBlacklist = new Map();
const BLACKLIST_TTL = 2 * 60 * 1000;

function isKeyBlacklisted(apiKey: string) {
  const exp = keyBlacklist.get(apiKey);
  if (!exp) return false;
  if (Date.now() > exp) { keyBlacklist.delete(apiKey); return false; }
  return true;
}

function blacklistKey(apiKey: string) {
  keyBlacklist.set(apiKey, Date.now() + BLACKLIST_TTL);
}

let geminiKeyPool: any[] = [];
let geminiKeyPoolTime = 0;
let geminiCurrentIndex = 0;

let groqKeyPool: any[] = [];
let groqKeyPoolTime = 0;
let groqCurrentIndex = 0;

const API_KEY_CACHE_TTL = 5 * 60 * 1000;

async function loadKeyPool(provider: string) {
  const now = Date.now();
  const payload = await getPayload({ config: configPromise });
  if (provider === "gemini") {
    if (geminiKeyPool.length > 0 && (now - geminiKeyPoolTime < API_KEY_CACHE_TTL)) return geminiKeyPool;
    try {
      const res = await payload.find({ collection: 'api-keys' as any, where: { provider: { equals: 'gemini' }, isActive: { equals: true } }, limit: 100 });
      geminiKeyPool = res.docs;
      geminiKeyPoolTime = now;
    } catch (e) {}
    return geminiKeyPool;
  } else {
    if (groqKeyPool.length > 0 && (now - groqKeyPoolTime < API_KEY_CACHE_TTL)) return groqKeyPool;
    try {
      const res = await payload.find({ collection: 'api-keys' as any, where: { provider: { equals: 'groq' }, isActive: { equals: true } }, limit: 100 });
      groqKeyPool = res.docs;
      groqKeyPoolTime = now;
    } catch (e) {}
    return groqKeyPool;
  }
}

export function clearApiKeyCache() {
  geminiKeyPool = []; geminiKeyPoolTime = 0; geminiCurrentIndex = 0;
}

export function clearGroqKeyCache() {
  groqKeyPool = []; groqKeyPoolTime = 0; groqCurrentIndex = 0;
}

export function clearKnowledgeCache() {
  knowledgeBaseCache = null; knowledgeCacheTime = 0;
}

export function removeVietnameseTones(str: string) {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

const VIETNAMESE_STOPWORDS = new Set([
  "la", "co", "khong", "tai", "o", "dau", "cua", "va", "cho", "hoi",
  "cdc", "da", "nang", "bao", "nhieu", "nhu", "the", "nao", "voi",
  "duoc", "cac", "nhung", "mot", "trong", "khi", "thi", "ma", "de",
  "ve", "nay", "do", "em", "anh", "chi", "minh", "toi", "ad", "admin",
  "vui", "long", "xin", "cam", "on", "oi", "a", "ha", "nhi", "vay",
  "nhe", "nha", "gi", "ai", "sao", "vi", "neu", "hay", "hoac", "den",
  "tu", "ra", "vao", "len", "xuong", "qua", "lai", "dang", "se", "vua",
  "moi", "rat", "lam", "hon", "nhat", "nua", "cung", "van", "con", "het",
  "tat", "ca", "bên", "ben", "trung", "tam", "tp", "thanh", "pho"
]);

const MAX_CHUNK_SIZE = 2200;

/**
 * Chia nhỏ tài liệu dài thành các phân đoạn có ngữ cảnh (Smart Chunking)
 * Giúp tránh việc 1 file 37.000 ký tự nuốt trọn điểm tìm kiếm và ngốn 20.000 token/lượt.
 */
function splitDocumentIntoChunks(doc: { title: string; category: string; content: string; isCore?: boolean }) {
  const rawContent = (doc.content || "").trim();
  if (!rawContent) return [];

  const baseTitle = (doc.title || "Tài liệu").trim();
  const baseCategory = (doc.category || "Thông tin chung").trim();

  // Nếu tài liệu ngắn (<= MAX_CHUNK_SIZE), giữ nguyên 1 chunk
  if (rawContent.length <= MAX_CHUNK_SIZE) {
    const titleNorm = removeVietnameseTones(`${baseTitle} ${baseCategory}`).toLowerCase();
    const contentNorm = removeVietnameseTones(rawContent).toLowerCase();
    return [{
      title: baseTitle,
      category: baseCategory,
      sectionTitle: "",
      content: rawContent,
      contentLen: rawContent.length,
      titleNorm,
      contentNorm,
      isCore: !!doc.isCore,
    }];
  }

  // Tách theo các tiêu đề Markdown (#, ##, ###) hoặc câu hỏi hoặc dòng trống kép
  const blocks = rawContent.split(/\n(?=#{1,4}\s|\*\*(?:Câu|Mục|Phần|Bài|\d+\.)|(?:Câu\s+\d+|Mục\s+\d+|PHẦN\s+[IVX\d]+))/i);
  const subBlocks: string[] = [];

  for (const block of blocks) {
    if (block.length <= MAX_CHUNK_SIZE) {
      subBlocks.push(block);
    } else {
      // Nếu block vẫn dài, tách tiếp theo đoạn văn (\n\n) hoặc dòng (\n)
      const paragraphs = block.split(/\n\n+/);
      let current = "";
      for (const p of paragraphs) {
        if (p.length > MAX_CHUNK_SIZE) {
          // Trường hợp bảng lớn hoặc văn bản chỉ có \n đơn
          const lines = p.split(/\n/);
          for (const line of lines) {
            if ((current + "\n" + line).length > MAX_CHUNK_SIZE && current.trim().length > 200) {
              subBlocks.push(current.trim());
              current = line;
            } else {
              current = current ? current + "\n" + line : line;
            }
          }
        } else if ((current + "\n\n" + p).length > MAX_CHUNK_SIZE && current.trim().length > 200) {
          subBlocks.push(current.trim());
          current = p;
        } else {
          current = current ? current + "\n\n" + p : p;
        }
      }
      if (current.trim()) subBlocks.push(current.trim());
    }
  }

  // Gộp các mảnh quá nhỏ liền kề nhau để đạt kích thước tối ưu (~1500 - 2200 ký tự)
  const mergedChunks: any[] = [];
  let buffer = "";
  let partIdx = 1;

  const flushBuffer = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const firstLine = trimmed.split("\n")[0].replace(/^[#*+\-\s]+/, "").slice(0, 120);
    const sectionTitle = subBlocks.length > 1 ? ` (Phần ${partIdx++}: ${firstLine})` : "";
    const titleNorm = removeVietnameseTones(`${baseTitle} ${baseCategory} ${firstLine}`).toLowerCase();
    const contentNorm = removeVietnameseTones(trimmed).toLowerCase();
    mergedChunks.push({
      title: `${baseTitle}${sectionTitle}`,
      category: baseCategory,
      sectionTitle: firstLine,
      content: trimmed,
      contentLen: trimmed.length,
      titleNorm,
      contentNorm,
      isCore: false,
    });
  };

  for (const sb of subBlocks) {
    if ((buffer + "\n\n" + sb).length <= MAX_CHUNK_SIZE) {
      buffer = buffer ? buffer + "\n\n" + sb : sb;
    } else {
      if (buffer) flushBuffer(buffer);
      buffer = sb;
    }
  }
  if (buffer) flushBuffer(buffer);

  return mergedChunks;
}

/**
 * Tải Kho tri thức kết hợp giữa:
 * 1. Tài liệu trong bảng `ai-knowledge` (chỉ lấy tài liệu công khai không giới hạn phòng ban)
 * 2. Dữ liệu động trực tiếp từ CMS: Danh mục Vắc xin (`vaccines`), Gói Vắc xin (`vaccine-packages`), Cơ cấu tổ chức (`org-units`)
 */
export async function loadKnowledgeBase() {
  const now = Date.now();
  if (knowledgeBaseCache && (now - knowledgeCacheTime < KNOWLEDGE_CACHE_TTL)) return knowledgeBaseCache;

  try {
    const payload = await getPayload({ config: configPromise });
    const [aiDocsRes, vaccinesRes, packagesRes, orgUnitsRes] = await Promise.all([
      payload.find({ collection: 'ai-knowledge' as any, limit: 1000, sort: '-updatedAt' }).catch(() => ({ docs: [] })),
      payload.find({ collection: 'vaccines' as any, limit: 300, sort: 'name' }).catch(() => ({ docs: [] })),
      payload.find({ collection: 'vaccine-packages' as any, where: { isActive: { equals: true } }, limit: 100, depth: 1, sort: 'order' }).catch(() => ({ docs: [] })),
      payload.find({ collection: 'org-units' as any, limit: 100, sort: 'order' }).catch(() => ({ docs: [] })),
    ]);

    let allChunks: any[] = [];

    // 1. Xử lý tài liệu từ ai-knowledge
    for (const doc of aiDocsRes.docs || []) {
      const allowedDept = (doc as any).allowedDepartment;
      // Nếu tài liệu giới hạn riêng cho phòng ban nội bộ thì không đưa vào public chatbot
      if (Array.isArray(allowedDept) && allowedDept.length > 0) continue;

      const content = ((doc as any).content || "").trim();
      if (!content) continue;

      const isShortCore = content.length <= 1500 && /lich|quy trinh|lien he/i.test(removeVietnameseTones((doc as any).title || ""));
      const docChunks = splitDocumentIntoChunks({
        title: (doc as any).title,
        category: (doc as any).category,
        content,
        isCore: isShortCore,
      });
      allChunks.push(...docChunks);
    }

    // 2. Tích hợp dữ liệu động: Danh mục Vắc xin lẻ trên CMS
    const vaccines = vaccinesRes.docs || [];
    if (vaccines.length > 0) {
      const statusMap: Record<string, string> = {
        in_stock: "Còn vắc xin",
        out_of_stock: "Tạm hết vắc xin",
        contact: "Liên hệ tư vấn",
      };
      const lines = vaccines.map((v: any) => {
        const priceStr = v.price ? `${Number(v.price).toLocaleString('vi-VN')}đ/liều` : "Liên hệ";
        const statusStr = statusMap[v.status] || "Còn vắc xin";
        const parts = [
          `+ **${v.name}**: Giá ${priceStr} (${statusStr})`,
          v.disease ? `Phòng bệnh: ${v.disease}` : "",
          v.origin ? `Xuất xứ: ${v.origin}` : "",
          v.targetGroup ? `Đối tượng: ${v.targetGroup}` : "",
          v.scheduleDoses ? `Phác đồ chuẩn: ${v.scheduleDoses} liều` : "",
          v.notes ? `Lưu ý: ${v.notes}` : "",
        ].filter(Boolean);
        return parts.join(" | ");
      });

      const vaccineLiveText =
        `Bảng giá và tình trạng vắc xin trực tuyến tại CDC Đà Nẵng (Xem chi tiết tại /goi-vac-xin):\n` +
        lines.join("\n");

      allChunks.push(...splitDocumentIntoChunks({
        title: "Bảng giá & Tình trạng Vắc xin lẻ trực tuyến (CMS Live)",
        category: "Giá vắc xin & Tiêm chủng",
        content: vaccineLiveText,
      }));
    }

    // 3. Tích hợp dữ liệu động: Gói Vắc xin Combo trên CMS
    const packages = packagesRes.docs || [];
    if (packages.length > 0) {
      const pkgBlocks = packages.map((pkg: any) => {
        const origPrice = pkg.originalPrice ? `${Number(pkg.originalPrice).toLocaleString('vi-VN')}đ` : "";
        const discPrice = pkg.discountPrice ? `${Number(pkg.discountPrice).toLocaleString('vi-VN')}đ` : origPrice;
        const itemLines = (pkg.items || []).map((it: any) => {
          const vName = typeof it.vaccine === 'object' && it.vaccine ? it.vaccine.name : "Vắc xin";
          const gName = typeof it.group === 'object' && it.group ? it.group.name : (it.diseaseName || "");
          const uPrice = it.unitPrice ? `${Number(it.unitPrice).toLocaleString('vi-VN')}đ/liều` : "";
          return `  • ${vName}${gName ? ` (Phòng: ${gName})` : ""}: ${it.doses || 1} liều${uPrice ? ` - Đơn giá: ${uPrice}` : ""}`;
        });
        return [
          `Gói vắc xin: **${pkg.name}** (Đối tượng: ${pkg.targetGroup || "Mọi đối tượng"})`,
          discPrice ? `Giá gói tham khảo: **${discPrice}**${origPrice && origPrice !== discPrice ? ` (Giá gốc: ${origPrice})` : ""}` : "",
          pkg.description ? `Mô tả: ${pkg.description}` : "",
          itemLines.length > 0 ? `Danh sách mũi tiêm trong gói:\n${itemLines.join("\n")}` : "",
        ].filter(Boolean).join("\n");
      });

      const pkgLiveText =
        `Danh sách các Gói Vắc xin Combo tại CDC Đà Nẵng (Xem chi tiết và đặt gói tại /goi-vac-xin):\n\n` +
        pkgBlocks.join("\n\n---\n\n");

      allChunks.push(...splitDocumentIntoChunks({
        title: "Danh sách Gói Vắc xin Combo (CMS Live)",
        category: "Gói vắc xin & Tiêm chủng",
        content: pkgLiveText,
      }));
    }

    // 4. Tích hợp dữ liệu động: Cơ cấu tổ chức & Danh bạ liên hệ các Khoa/Phòng
    const orgUnits = orgUnitsRes.docs || [];
    if (orgUnits.length > 0) {
      const unitLines = orgUnits.map((u: any) => {
        const leaders = (u.members || [])
          .filter((m: any) => ['giam_doc', 'pho_giam_doc', 'truong', 'quyen_truong', 'pho_truong'].includes(m.position))
          .map((m: any) => {
            const posLabel =
              m.position === 'giam_doc' ? 'Giám đốc' :
              m.position === 'pho_giam_doc' ? 'Phó Giám đốc' :
              m.position === 'truong' ? 'Trưởng đơn vị' :
              m.position === 'quyen_truong' ? 'Quyền Trưởng phòng/khoa' :
              'Phó Trưởng đơn vị';
            return `${m.memberName} (${posLabel})`;
          })
          .join(", ");
        return [
          `+ **${u.name}**`,
          u.shortDescription ? `Chức năng: ${u.shortDescription}` : "",
          u.phone ? `Điện thoại: ${u.phone}` : "",
          u.email ? `Email: ${u.email}` : "",
          leaders ? `Phụ trách: ${leaders}` : "",
        ].filter(Boolean).join(" | ");
      });

      allChunks.push(...splitDocumentIntoChunks({
        title: "Cơ cấu tổ chức, Ban Giám đốc & Khoa Phòng CDC Đà Nẵng",
        category: "Thông tin đơn vị & Liên hệ",
        content: unitLines.join("\n"),
      }));
    }

    knowledgeBaseCache = allChunks;
    knowledgeCacheTime = now;
    return allChunks;
  } catch (err) {
    console.error("[loadKnowledgeBase Error]", err);
    return knowledgeBaseCache || [];
  }
}

/**
 * Mở rộng từ khóa đồng nghĩa phổ biến để tăng độ nhạy khi người dân gõ tắt / sai chính tả
 */
function expandQueryKeywords(normalizedQ: string): string[] {
  let extra: string[] = [];
  if (/\b(vacxin|vaccine|vacin|vx|tiem|mui)\b/.test(normalizedQ)) {
    extra.push("vac", "xin", "tiem", "chung");
  }
  if (/\b(gia|tien|phi|bao nhieu)\b/.test(normalizedQ)) {
    extra.push("gia", "bang");
  }
  if (/\b(lich|gio|lam viec|mo cua|thu 7|chu nhat|ngay nghi|buoi)\b/.test(normalizedQ)) {
    extra.push("lich", "tiem", "kham", "gio");
  }
  if (/\b(sxh|sot xuat huyet)\b/.test(normalizedQ)) {
    extra.push("sot", "xuat", "huyet");
  }
  if (/\b(tcmr|mo rong)\b/.test(normalizedQ)) {
    extra.push("tiem", "chung", "mo", "rong");
  }
  return extra;
}

/**
 * Thuật toán truy xuất phân đoạn thông minh (BM25 + Phrase Matching + Title Weighting)
 * Ngăn chặn triệt để hiện tượng tài liệu dài 37.000 ký tự lấn át tài liệu ngắn.
 */
function retrieveRelevantKnowledge(question: string, chunks: any[], history: any[] = []) {
  if (!chunks || chunks.length === 0) return "";

  // Kết hợp câu hỏi hiện tại (trọng số chính) và câu hỏi ngay trước đó nếu câu hiện tại quá ngắn (VD: "giá bao nhiêu?", "còn hàng không?")
  let queryText = question;
  if (question.trim().split(/\s+/).length <= 4 && history.length > 0) {
    const lastUserMsg = [...history].reverse().find(m => m.role === "user");
    if (lastUserMsg) {
      queryText = `${lastUserMsg.content} ${question}`;
    }
  }

  const normalizedQ = removeVietnameseTones(queryText)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const rawWords = normalizedQ.split(" ").filter(w => w.length > 1);
  const filteredWords = rawWords.filter(w => !VIETNAMESE_STOPWORDS.has(w));
  const extraWords = expandQueryKeywords(normalizedQ);

  // Tập từ khóa duy nhất để tính điểm
  const keywords = [...new Set([...(filteredWords.length > 0 ? filteredWords : rawWords), ...extraWords])];
  if (keywords.length === 0) return "";

  // Tạo danh sách cụm 2 từ liền kề (bigrams) từ câu hỏi gốc (đã bỏ từ dừng ở rìa)
  const bigrams: string[] = [];
  for (let i = 0; i < rawWords.length - 1; i++) {
    const w1 = rawWords[i];
    const w2 = rawWords[i + 1];
    if (!VIETNAMESE_STOPWORDS.has(w1) || !VIETNAMESE_STOPWORDS.has(w2)) {
      bigrams.push(`${w1} ${w2}`);
    }
  }

  const avgLen = chunks.reduce((sum, c) => sum + (c.contentLen || 1000), 0) / chunks.length || 1200;
  const k1 = 1.5;
  const b = 0.75;

  const scoredChunks = chunks.map(chunk => {
    let score = 0;
    let matchedKeywords = 0;

    // 1. Điểm khớp cụm từ (Bigrams) - Cực kỳ quan trọng cho tiếng Việt ("lich tiem", "gia vac", "quay thuoc")
    for (const bg of bigrams) {
      if (chunk.titleNorm.includes(bg)) {
        score += 30;
      }
      if (chunk.contentNorm.includes(bg)) {
        score += 12;
      }
    }

    // 2. Điểm khớp từng từ khóa với bão hòa độ dài BM25
    for (const kw of keywords) {
      let kwMatched = false;

      if (chunk.titleNorm.includes(kw)) {
        score += 14;
        kwMatched = true;
      }

      const occurrences = chunk.contentNorm.split(kw).length - 1;
      if (occurrences > 0) {
        kwMatched = true;
        // Công thức bão hòa BM25: dù xuất hiện 50 lần trong văn bản dài cũng chỉ tối đa ~(k1 + 1) = 2.5x
        const tfNorm = (occurrences * (k1 + 1)) / (occurrences + k1 * (1 - b + b * ((chunk.contentLen || 1000) / avgLen)));
        score += tfNorm * 4;
      }

      if (kwMatched) matchedKeywords++;
    }

    // 3. Điểm thưởng độ phủ từ khóa (Coverage Bonus): ưu tiên đoạn chứa nhiều từ khóa khác nhau của câu hỏi
    if (keywords.length > 1 && matchedKeywords > 1) {
      const coverageRatio = matchedKeywords / keywords.length;
      score *= (1 + coverageRatio * 0.6);
    }

    return { ...chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  // Chọn các phân đoạn có điểm cao nhất trong ngân sách ~13.000 ký tự (~3.500 tokens)
  const MAX_CONTEXT_CHARS = 13500;
  const selectedChunks: any[] = [];
  let currentChars = 0;

  for (const chunk of scoredChunks) {
    if (chunk.score <= 0) break;
    if (currentChars + chunk.contentLen > MAX_CONTEXT_CHARS && selectedChunks.length >= 2) {
      continue;
    }
    selectedChunks.push(chunk);
    currentChars += chunk.contentLen;
    if (selectedChunks.length >= 6 || currentChars >= MAX_CONTEXT_CHARS) break;
  }

  // Luôn đính kèm tài liệu hạt nhân ngắn (như Lịch tiêm chủng 783 ký tự) nếu chưa có và còn dư chỗ
  for (const coreChunk of chunks.filter(c => c.isCore)) {
    if (!selectedChunks.some(s => s.title === coreChunk.title) && currentChars + coreChunk.contentLen <= MAX_CONTEXT_CHARS + 1500) {
      selectedChunks.push(coreChunk);
      currentChars += coreChunk.contentLen;
    }
  }

  if (selectedChunks.length === 0) {
    selectedChunks.push(...chunks.slice(0, 3));
  }

  let combinedText = "";
  const matchedTitlesSet = new Set<string>();
  for (const chunk of selectedChunks) {
    if (chunk.title) matchedTitlesSet.add(chunk.title);
    combinedText += `\n\n[CHUYÊN MÔN: ${(chunk.category || "").toUpperCase()}]\n--- Tài liệu: ${chunk.title} ---\n${chunk.content}`;
  }

  return {
    combinedText: combinedText.trim(),
    matchedSources: Array.from(matchedTitlesSet).join(" | "),
  };
}

/**
 * Tự động phân loại trạng thái câu trả lời của AI để phục vụ thống kê và bổ sung Kho tri thức
 */
export function classifyAnswerStatus(answer: string): "answered" | "unanswered" | "out_of_scope" | "error" {
  const lower = (answer || "").toLowerCase();
  if (
    lower.includes("đang xử lý lượng lớn yêu cầu") ||
    lower.includes("hệ thống tạm thời gián đoạn") ||
    lower.includes("không có phản hồi từ ai")
  ) {
    return "error";
  }
  if (
    lower.includes("chỉ hỗ trợ các thông tin về y tế và dịch vụ của cdc đà nẵng")
  ) {
    return "out_of_scope";
  }
  if (
    lower.includes("chưa có thông tin chi tiết trong hệ thống") ||
    lower.includes("chưa có thông tin trong hệ thống") ||
    lower.includes("tôi chưa có thông tin") ||
    lower.includes("chưa được cập nhật trong hệ thống")
  ) {
    return "unanswered";
  }
  return "answered";
}

/**
 * Làm sạch nhẹ nhàng đầu ra của AI nhưng GIỮ LẠI định dạng **in đậm**, danh sách và đường dẫn URL
 * để ChatWidget hiển thị đẹp mắt, dễ đọc và bấm gọi/mở link được.
 */
function formatAIResponse(text: string) {
  if (!text) return "";
  return text
    .replace(/^#{1,6}\s+(.+)$/gm, "**$1**") // Chuyển tiêu đề ### thành **In đậm** gọn gàng trong khung chat
    .replace(/^>\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")         // Chuẩn hóa bullet list thành dấu •
    .replace(/`([^`]+)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function prepareAIContext(userId: string, question: string, providedHistory: any[] = []) {
  const payload = await getPayload({ config: configPromise });
  const [knowledgeChunks, settingsResult] = await Promise.all([
    loadKnowledgeBase(),
    payload.findGlobal({ slug: "site-settings", depth: 0 })
  ]);

  const settings = settingsResult as any;
  const aiChat = settings?.aiChatSettings || {};

  const hotline = aiChat.aiHotline || "1900988975";
  const address = aiChat.aiAddress || "118 Lê Đình Lý, Phường Thanh Khê Đông, Quận Thanh Khê, Thành phố Đà Nẵng";
  const customPrompt = aiChat.chatCustomPrompt || "";
  const aiModel = aiChat.aiModel || "gemini-2.5-flash";

  const retrievalResult = retrieveRelevantKnowledge(question, knowledgeChunks, providedHistory);
  const knowledgeText = typeof retrievalResult === "string" ? retrievalResult : retrievalResult.combinedText;
  const matchedSources = typeof retrievalResult === "string" ? "" : retrievalResult.matchedSources;

  const uniqueCategories = [...new Set(knowledgeChunks.map((c: any) => c.category).filter(Boolean))];
  const categoryList = uniqueCategories.length > 0 ? uniqueCategories.join(", ") : "Tiêm chủng, Vắc xin, Phòng chống dịch bệnh, Xét nghiệm";

  const systemInstruction = `Bạn là Trợ lý AI chính thức của Trung tâm Kiểm soát bệnh tật TP. Đà Nẵng (CDC Đà Nẵng). Vai trò của bạn là hỗ trợ, giải đáp thắc mắc về y tế, tiêm chủng, vắc xin và dịch vụ cho người dân.

QUY TẮC BẮT BUỘC:
1. CHỈ trả lời dựa trên TÀI LIỆU CHUYÊN MÔN được cung cấp bên dưới. Không tự bịa đặt số liệu hay giá cả ngoài tài liệu.
2. Nếu câu hỏi KHÔNG liên quan đến y tế, sức khỏe hoặc dịch vụ của CDC Đà Nẵng, hãy trả lời lịch sự: "Xin lỗi, tôi chỉ hỗ trợ các thông tin về y tế và dịch vụ của CDC Đà Nẵng. Để được tư vấn thêm, bạn vui lòng gọi hotline **${hotline}**."
3. Nếu tài liệu bên dưới KHÔNG CÓ thông tin người dân hỏi, hãy nói: "Về nội dung này, hiện tôi chưa có thông tin chi tiết trong hệ thống. Bạn vui lòng liên hệ trực tiếp CDC Đà Nẵng qua hotline **${hotline}** hoặc đến địa chỉ **${address}** để được cán bộ y tế tư vấn chính xác nhất."
4. Khi tra cứu dữ liệu (bảng giá vắc xin, gói tiêm, thuốc, lịch làm việc...), PHẢI ĐỌC KỸ TOÀN BỘ TÀI LIỆU. Nếu có nhiều loại liên quan (ví dụ: người dân hỏi vắc xin cúm hoặc gói vắc xin cho trẻ), hãy liệt kê ĐẦY ĐỦ và rõ ràng từng loại kèm giá và tình trạng.
5. Người dùng có thể viết tắt, sai chính tả hoặc không dấu (VD: "vacxin" = "vắc xin", "sxh" = "sốt xuất huyết"). Hãy tự động hiểu và đối chiếu đúng thông tin.
6. CÁCH TRÌNH BÀY ĐẸP & DỄ ĐỌC:
   - Sử dụng **in đậm** (cú pháp \`**từ khóa**\`) cho tên vắc xin, tên dịch vụ, mức giá tiền, khung giờ làm việc và số hotline để người đọc dễ nhìn.
   - Dùng dấu \`•\` hoặc số thứ tự \`1. 2. 3.\` để liệt kê từng mục trên từng dòng riêng biệt, tuyệt đối không viết dính liền một đoạn dài.
   - Khi tư vấn về vắc xin hoặc gói tiêm chủng, hãy gợi ý người dân có thể xem bảng giá chi tiết tại trang: /goi-vac-xin
7. GIAO TIẾP THÂN THIỆN: Nếu người dùng chào hỏi hoặc hỏi bạn làm được gì, hãy giới thiệu ngắn gọn và gợi ý các chủ đề bạn có thể hỗ trợ: ${categoryList}.

${customPrompt ? `CÁC QUY TẮC BỔ SUNG TỪ ADMIN (ƯU TIÊN CAO):\n${customPrompt}\n` : ""}
TÀI LIỆU CHUYÊN MÔN ĐƯỢC TRÍCH XUẤT:
${knowledgeText || `(Chưa có tài liệu. Vui lòng liên hệ hotline ${hotline}.)`}`;

  const history: any[] = [];
  for (const msg of providedHistory) {
    if (msg.role === "user") {
      history.push({ role: "user", parts: [{ text: msg.content }] });
    } else if (msg.role === "assistant") {
      let text = msg.content.replace(/\(Địa chỉ:.*?\)/g, "").trim();
      history.push({ role: "model", parts: [{ text }] });
    }
  }

  return { systemInstruction, history, hotline, address, footerMsg: null, aiModel, matchedSources };
}

export async function askAIWithMeta(userId: string, question: string, providedHistory: any[] = []) {
  const startTime = Date.now();
  const ctx = await prepareAIContext(userId, question, providedHistory);
  const aiModel = ctx.aiModel || "gemini-2.5-flash";

  let answer = "";
  if (aiModel.includes("llama") || aiModel.includes("groq")) {
    answer = await askGroq(userId, question, providedHistory, ctx);
  } else {
    answer = await askGemini(userId, question, providedHistory, ctx, aiModel);
  }

  const responseTimeMs = Date.now() - startTime;
  const status = classifyAnswerStatus(answer);

  return {
    answer,
    status,
    matchedSources: ctx.matchedSources || "",
    modelUsed: aiModel,
    responseTimeMs,
  };
}

export async function askAI(userId: string, question: string, providedHistory: any[] = []) {
  const res = await askAIWithMeta(userId, question, providedHistory);
  return res.answer;
}

async function askGemini(userId: string, question: string, providedHistory: any[] = [], contextOverride?: any, aiModel: string = "gemini-2.5-flash") {
  const pool = await loadKeyPool("gemini");
  const fallbackKey = process.env.GEMINI_API_KEY;
  if (pool.length === 0 && !fallbackKey) {
    console.warn("[AI Router] Không có Gemini key, chuyển sang Groq...");
    return await askGroq(userId, question, providedHistory, contextOverride);
  }

  const ctx = contextOverride || await prepareAIContext(userId, question, providedHistory);
  const { systemInstruction, history, hotline, footerMsg } = ctx;
  const contents = [...history, { role: "user", parts: [{ text: question }] }];

  const startIdx = pool.length > 0 ? (geminiCurrentIndex % pool.length) : 0;
  const allKeys = pool.length > 0
    ? [...pool.slice(startIdx).map(k => k.apiKey), ...pool.slice(0, startIdx).map(k => k.apiKey), fallbackKey].filter(Boolean)
    : [fallbackKey].filter(Boolean);

  const activeKeys = allKeys.filter(k => !isKeyBlacklisted(k));
  if (pool.length > 0) geminiCurrentIndex = (geminiCurrentIndex + 1) % pool.length;

  if (activeKeys.length === 0) {
    console.warn("[AI Router] Toàn bộ Gemini key đang bị rate-limit, chuyển sang Groq...");
    try {
      return await askGroq(userId, question, providedHistory, ctx);
    } catch {
      return `Hệ thống AI đang xử lý lượng lớn yêu cầu. Vui lòng thử lại sau ít phút hoặc gọi hotline **${hotline}**.`;
    }
  }

  for (let i = 0; i < activeKeys.length; i++) {
    const keyObj = pool.find(k => k.apiKey === activeKeys[i]);
    const apiKey = activeKeys[i];
    const modelToUse = keyObj?.preferredModel || aiModel;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelToUse,
        contents,
        config: { systemInstruction, maxOutputTokens: 2048, temperature: 0.25 }
      });

      const usedTokens = response.usageMetadata?.totalTokenCount || 0;
      if (usedTokens > 0) {
        const currentPool = await loadKeyPool("gemini");
        const matchedKey = currentPool.find(k => k.apiKey === apiKey);
        if (matchedKey) {
          const payload = await getPayload({ config: configPromise });
          payload.update({
            collection: 'api-keys' as any,
            id: matchedKey.id,
            data: { usageTokens: (matchedKey.usageTokens || 0) + usedTokens, usageCount: (matchedKey.usageCount || 0) + 1 }
          }).catch(e => console.error("[Token Update Error]", e));
        }
      }

      let cleanedAnswer = formatAIResponse(response.text || "Xin lỗi, hệ thống tạm thời gián đoạn.");
      if (footerMsg) cleanedAnswer += "\n\n" + footerMsg;
      return cleanedAnswer;
    } catch (err: any) {
      const errMsg = err.message?.toLowerCase() || "";
      const isRateLimit = errMsg.includes("429") || errMsg.includes("resource_exhausted") || errMsg.includes("quota");
      const isUnavailable = errMsg.includes("503") || errMsg.includes("unavailable") || errMsg.includes("high demand") || errMsg.includes("overloaded");
      const isNotFound = errMsg.includes("404") || errMsg.includes("not found") || errMsg.includes("model");

      if (isRateLimit) { blacklistKey(apiKey); continue; }
      if (isUnavailable || isNotFound) continue;
      throw err;
    }
  }

  console.warn("[AI Router] Toàn bộ Gemini key thất bại, thử Groq...");
  try {
    return await askGroq(userId, question, providedHistory, ctx);
  } catch {
    return `Hệ thống AI đang xử lý lượng lớn yêu cầu. Vui lòng thử lại sau ít phút hoặc gọi hotline **${hotline}**.`;
  }
}

async function askGroq(userId: string, question: string, providedHistory: any[] = [], contextOverride?: any) {
  const pool = await loadKeyPool("groq");
  if (pool.length === 0) throw new Error("Chưa có cấu hình Groq API Key.");

  const ctx = contextOverride || await prepareAIContext(userId, question, providedHistory);
  const { systemInstruction, hotline, footerMsg } = ctx;

  const groqMessages: any[] = [{ role: "system", content: systemInstruction }];
  for (const h of providedHistory) {
    groqMessages.push({
      role: h.role === "assistant" ? "assistant" : "user",
      content: h.content
    });
  }
  groqMessages.push({ role: "user", content: question });

  const startIdx = pool.length > 0 ? (groqCurrentIndex % pool.length) : 0;
  const allKeys = [...pool.slice(startIdx).map(k => k.apiKey), ...pool.slice(0, startIdx).map(k => k.apiKey)].filter(Boolean);
  const activeKeys = allKeys.filter(k => !isKeyBlacklisted(k));
  if (pool.length > 0) groqCurrentIndex = (groqCurrentIndex + 1) % pool.length;

  if (activeKeys.length === 0) {
    return `Hệ thống AI đang xử lý lượng lớn yêu cầu. Vui lòng thử lại sau ít phút hoặc gọi hotline **${hotline}**.`;
  }

  for (let i = 0; i < activeKeys.length; i++) {
    const keyObj = pool.find(k => k.apiKey === activeKeys[i]);
    const apiKey = activeKeys[i];
    const modelToUse = keyObj?.preferredModel || "llama-3.3-70b-versatile";

    try {
      const groq = new Groq({ apiKey });
      const chatCompletion = await groq.chat.completions.create({
        messages: groqMessages,
        model: modelToUse,
        temperature: 0.25,
        max_tokens: 2048,
      });

      const usedTokens = chatCompletion.usage?.total_tokens || 0;
      if (usedTokens > 0) {
        const currentPool = await loadKeyPool("groq");
        const matchedKey = currentPool.find(k => k.apiKey === apiKey);
        if (matchedKey) {
          const payload = await getPayload({ config: configPromise });
          payload.update({
            collection: 'api-keys' as any,
            id: matchedKey.id,
            data: { usageTokens: (matchedKey.usageTokens || 0) + usedTokens, usageCount: (matchedKey.usageCount || 0) + 1 }
          }).catch(e => console.error("[Token Update Error Groq]", e));
        }
      }

      const rawAnswer = chatCompletion.choices[0]?.message?.content || "Xin lỗi, không có phản hồi từ AI.";
      let cleanedAnswer = formatAIResponse(rawAnswer);
      if (footerMsg) cleanedAnswer += "\n\n" + footerMsg;
      return cleanedAnswer;
    } catch (err: any) {
      if (err.status === 429 || err.status === 503 || err.status === 500) { blacklistKey(apiKey); continue; }
      throw err;
    }
  }
  return `Hệ thống AI đang xử lý lượng lớn yêu cầu. Vui lòng thử lại sau ít phút hoặc gọi hotline **${hotline}**.`;
}
