const fs = require('fs');

/**
 * Parse 1 dòng INSERT VALUES của NukeViet tms_vi_news_rows
 * Cấu trúc cột: id, catid, listcatid, topicid, admin_id, author, sourceid,
 *               addtime, edittime, status, weight, publtime, exptime, archive,
 *               title, alias, hometext, homeimgfile, homeimgalt, homeimgthumb,
 *               inhome, allowed_comm, allowed_rating, external_link,
 *               hitstotal, hitscm, total_rating, click_rating, instant_active,
 *               instant_template, instant_creatauto
 */
function parseRowTuple(tupleStr) {
  // Phân tích bằng state machine để xử lý chuỗi có dấu phẩy bên trong nháy đơn
  const values = [];
  let current = '';
  let inStr = false;
  let escaping = false;

  for (let i = 0; i < tupleStr.length; i++) {
    const c = tupleStr[i];
    if (escaping) {
      // Ký tự trước là backslash
      if (c === 'n') current += '\n';
      else if (c === 'r') current += '\r';
      else if (c === 't') current += '\t';
      else current += c;
      escaping = false;
      continue;
    }
    if (c === '\\') { escaping = true; continue; }
    if (c === "'" && !inStr) { inStr = true; continue; }
    if (c === "'" && inStr) {
      // Check nháy đơn liên tiếp (thoát chuỗi SQL)
      if (tupleStr[i+1] === "'") { current += "'"; i++; continue; }
      inStr = false;
      continue;
    }
    if (!inStr && c === ',') {
      values.push(current);
      current = '';
      continue;
    }
    current += c;
  }
  values.push(current);

  if (values.length < 15) return null;

  const id = parseInt(values[0]);
  const catid = parseInt(values[1]);
  const addtime = parseInt(values[7]);    // col index 7
  const publtime = parseInt(values[11]);  // col index 11 = publtime
  const title = values[14] ? values[14].trim() : '';
  const alias = values[15] ? values[15].trim() : '';
  const hometext = values[16] ? values[16].trim() : '';
  const homeimgfile = values[17] ? values[17].trim() : '';
  const hitstotal = parseInt(values[24]) || 0; // col index 24

  if (!title || !alias) return null;

  return { id, catid, publtime, addtime, title, slug: alias, description: hometext, image: homeimgfile, hitstotal };
}

async function main() {
  console.log("1. Đọc file SQL lớn...");
  const sqlPath = 'C:\\Users\\SingPC\\Downloads\\ksbtdana6a10_home_1784081197.sql';
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Tìm vị trí bảng news_rows
  const insertStart = sql.indexOf("INSERT INTO `tms_vi_news_rows` VALUES");
  if (insertStart === -1) { console.error("Không tìm thấy INSERT INTO tms_vi_news_rows"); return; }

  const valuesStart = sql.indexOf('(', insertStart);
  // Tìm điểm kết thúc của câu INSERT này (';' sau dấu đóng cuối cùng)
  let endIdx = sql.indexOf(';\n', valuesStart);
  if (endIdx === -1) endIdx = sql.indexOf(';\r\n', valuesStart);
  if (endIdx === -1) endIdx = sql.length;

  const valuesStr = sql.substring(valuesStart, endIdx);

  console.log(`2. Phân tích dữ liệu (${valuesStr.length} bytes)...`);

  // Tách từng record: bắt đầu bằng '(' và kết thúc bằng '),' hoặc ');'
  // Dùng state machine đơn giản
  const records = [];
  let depth = 0;
  let inStr = false;
  let escaping = false;
  let recordStart = -1;

  for (let i = 0; i < valuesStr.length; i++) {
    const c = valuesStr[i];
    if (escaping) { escaping = false; continue; }
    if (c === '\\' && inStr) { escaping = true; continue; }
    if (c === "'" && !inStr) { inStr = true; continue; }
    if (c === "'" && inStr) {
      if (valuesStr[i+1] === "'") { i++; continue; } // escaped quote
      inStr = false; continue;
    }
    if (inStr) continue;
    if (c === '(') {
      if (depth === 0) recordStart = i + 1;
      depth++;
    } else if (c === ')') {
      depth--;
      if (depth === 0 && recordStart !== -1) {
        records.push(valuesStr.substring(recordStart, i));
        recordStart = -1;
      }
    }
  }

  console.log(`3. Tổng số bản ghi tìm thấy: ${records.length}`);

  // Tìm bài mới nhất để xem phân bố
  const articles = [];
  for (const rec of records) {
    const parsed = parseRowTuple(rec);
    if (parsed) articles.push(parsed);
  }

  // Sắp xếp theo publtime
  articles.sort((a, b) => b.publtime - a.publtime);

  console.log('\n=== 15 BÀI MỚI NHẤT TRONG FILE SQL ===');
  articles.slice(0, 15).forEach(a => {
    const d = new Date(a.publtime * 1000);
    console.log(`  ${d.toLocaleDateString('vi-VN')} | ID:${a.id} | ${a.title}`);
  });

  const jul1_2026 = Math.floor(new Date('2026-07-01').getTime() / 1000);
  const jun1_2026 = Math.floor(new Date('2026-06-01').getTime() / 1000);
  const newAfterJul = articles.filter(a => a.publtime >= jul1_2026);
  const newAfterJun = articles.filter(a => a.publtime >= jun1_2026);
  
  console.log(`\nBài sau 01/06/2026: ${newAfterJun.length}`);
  console.log(`Bài sau 01/07/2026: ${newAfterJul.length}`);

  console.log('\n=== PHÂN BỐ THEO NĂM ===');
  const byYear = {};
  articles.forEach(a => {
    const y = new Date(a.publtime * 1000).getFullYear();
    byYear[y] = (byYear[y] || 0) + 1;
  });
  Object.keys(byYear).sort().forEach(y => console.log(`  ${y}: ${byYear[y]} bài`));

  // Lưu kết quả
  fs.writeFileSync('D:\\CDC\\webcq\\next-frontend\\news_data_fixed.json', JSON.stringify(articles, null, 2));
  console.log(`\nĐã lưu ${articles.length} bài vào news_data_fixed.json`);
}

main().catch(console.error);
