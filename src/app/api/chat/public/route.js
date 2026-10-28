import { NextResponse } from "next/server";
import { askAIWithMeta } from "@/lib/gemini";

// ============================================================
// GET /api/chat/public - Lấy cấu hình bật/tắt & tin nhắn chào mừng
// ============================================================
export async function GET(request) {
  try {
    const { getPayload } = await import("payload");
    const config = await import("@payload-config");
    const payload = await getPayload({ config: config.default });
    const payloadSettings = await payload.findGlobal({ slug: "site-settings", depth: 0 });
    const aiChat = payloadSettings?.aiChatSettings;
    
    return NextResponse.json({
      success: true,
      enabled: aiChat?.chatEnabled !== false, // Mặc định là true nếu chưa lưu cấu hình
      welcomeMessage: aiChat?.chatWelcomeMessage || "Xin chào! Tôi là Trợ lý AI của CDC Đà Nẵng. Tôi có thể giúp gì cho bạn hôm nay?",
      hotline: aiChat?.aiHotline || "1900988975",
    });
  } catch (error) {
    console.error("[GET /api/chat/public] Error:", error);
    return NextResponse.json(
      { success: false, error: "Hệ thống đang gặp sự cố." },
      { status: 500 }
    );
  }
}

// ============================================================
// Rate Limiting đơn giản theo IP (in-memory)
// ============================================================
const rateMap = new Map(); // IP -> { count, resetAt }
const RATE_LIMIT = 12;     // tối đa 12 requests
const RATE_WINDOW = 60_000; // trong 60 giây

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Ẩn danh một phần IP để bảo vệ quyền riêng tư người dân
function maskClientIp(ip) {
  if (!ip || ip === "unknown") return "unknown";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
  }
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 3).join(":") + ":***";
  }
  return ip;
}

// Cleanup cũ mỗi 5 phút để tránh memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap.entries()) {
    if (now > entry.resetAt) rateMap.delete(ip);
  }
}, 5 * 60_000);

// ============================================================
// POST /api/chat/public
// Body: { question: string, history: [{role, content}][] }
// ============================================================
export async function POST(request) {
  try {
    // Lấy IP để rate limit
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Bạn đang gửi quá nhiều câu hỏi. Vui lòng chờ một phút rồi thử lại." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const question = (body.question || "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập câu hỏi." },
        { status: 400 }
      );
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Câu hỏi quá dài. Vui lòng rút ngắn lại." },
        { status: 400 }
      );
    }

    // Giới hạn lịch sử: chỉ giữ 10 tin nhắn gần nhất
    const trimmedHistory = history.slice(-10).filter(
      (m) => m && typeof m.role === "string" && typeof m.content === "string"
    );

    const aiResult = await askAIWithMeta("public_" + ip, question, trimmedHistory);

    // Lưu lịch sử hỏi đáp vào CSDL để thống kê & phát hiện câu hỏi thiếu tri thức
    let logId = null;
    try {
      const { getPayload } = await import("payload");
      const config = await import("@payload-config");
      const payload = await getPayload({ config: config.default });
      const createdLog = await payload.create({
        collection: "ai-chat-logs",
        data: {
          question,
          answer: aiResult.answer,
          status: aiResult.status,
          feedback: "none",
          matchedSources: aiResult.matchedSources || "Không khớp trực tiếp",
          modelUsed: aiResult.modelUsed || "gemini-2.5-flash",
          responseTimeMs: aiResult.responseTimeMs || 0,
          clientIp: maskClientIp(ip),
          isResolved: false,
        },
      });
      logId = createdLog?.id || null;
    } catch (logErr) {
      console.error("[POST /api/chat/public] Không thể ghi log AI:", logErr?.message || logErr);
    }

    return NextResponse.json({
      success: true,
      answer: aiResult.answer,
      logId,
    });
  } catch (error) {
    console.error("[POST /api/chat/public] Error:", error);
    return NextResponse.json(
      { success: false, error: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH /api/chat/public - Ghi nhận đánh giá 👍 / 👎 của người dân
// Body: { logId: number | string, feedback: 'helpful' | 'not_helpful' }
// ============================================================
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { logId, feedback } = body || {};

    if (!logId || !["helpful", "not_helpful"].includes(feedback)) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu đánh giá không hợp lệ." },
        { status: 400 }
      );
    }

    const { getPayload } = await import("payload");
    const config = await import("@payload-config");
    const payload = await getPayload({ config: config.default });

    await payload.update({
      collection: "ai-chat-logs",
      id: logId,
      data: {
        feedback,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/chat/public] Error:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lưu đánh giá." },
      { status: 500 }
    );
  }
}
