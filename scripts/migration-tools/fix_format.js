const fs = require('fs');
const { Client } = require('pg');

function stripHtml(html) {
  // 1. Xóa các \r\n thật trong source HTML để tránh ngắt câu ngẫu nhiên
  let text = (html || '').replace(/\r?\n/g, ' ');
  // 2. Chuyển các thẻ block và <br> thành \n
  text = text.replace(/<\/?(?:div|p|h[1-6]|ul|ol|li|table|tr|td|th|tbody|thead|tfoot|blockquote|article|section)[^>]*>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  // 3. Xóa tất cả các thẻ còn lại (span, strong, a, v.v) nhưng không xuống dòng
  text = text.replace(/<[^>]*>/g, '');
  // 4. Giải mã entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&#039;/g, "'")
             .replace(/&#x2F;/gi, "/")
             .replace(/&#x3A;/gi, ":");
  // 5. Chuẩn hóa space
  text = text.replace(/[ \t]+/g, ' ');
  return text;
}

function createLexicalJson(text) {
  const paragraphs = text.split('\n').map(p => p.trim()).filter(p => p !== '');
  
  if (paragraphs.length === 0) {
    paragraphs.push(" ");
  }

  return {
    root: {
      type: "root", format: "", indent: 0, version: 1,
      direction: "ltr",
      children: paragraphs.map(p => ({
        type: "paragraph", 
        format: "justify", 
        indent: 0, 
        version: 1,
        children: [{ mode: "normal", text: p.substring(0, 10000), type: "text", style: "", detail: 0, format: 0, version: 1 }]
      }))
    }
  };
}

async function fixDb() {
  const c = new Client('postgresql://postgres:123456@127.0.0.1:5432/webcq');
  await c.connect();
  try {
    console.log("1. Cập nhật các bài viết cũ từ news_data_fixed.json...");
    const newsData = JSON.parse(fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\news_data_fixed.json', 'utf8'));
    const bodyMap = {};
    for (const item of newsData) {
      if (item.slug && item.bodyhtml) {
        bodyMap[item.slug] = item.bodyhtml;
      }
    }

    const { rows } = await c.query('SELECT id, slug FROM articles');
    let updatedOld = 0;
    for (const row of rows) {
      if (bodyMap[row.slug]) {
        const text = stripHtml(bodyMap[row.slug]);
        const lexical = createLexicalJson(text);
        await c.query('UPDATE articles SET content = $1 WHERE id = $2', [lexical, row.id]);
        updatedOld++;
      }
    }
    console.log(`-> Đã sửa định dạng (xuống dòng + justify) cho ${updatedOld} bài viết cũ.`);

    console.log("2. Đặt image = null cho các bài mới (từ 01/07) để API crawl lại nội dung chuẩn...");
    const r = await c.query("UPDATE articles SET image = null WHERE published_at >= '2026-07-01'");
    console.log(`-> Đã reset image cho ${r.rowCount} bài viết mới.`);

  } finally {
    await c.end();
  }
}

fixDb().catch(console.error);
