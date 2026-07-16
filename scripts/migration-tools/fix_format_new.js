const { Client } = require('pg');

async function fixDb() {
  const c = new Client('postgresql://postgres:123456@127.0.0.1:5432/webcq');
  await c.connect();
  try {
    console.log("Xóa image_id để kích hoạt crawl lại cho bài viết từ 01/07/2026...");
    const r = await c.query("UPDATE articles SET image_id = null WHERE published_at >= '2026-07-01'");
    console.log(`-> Đã reset ${r.rowCount} bài viết mới. Bạn có thể chạy lại API seed-news.`);
  } catch(e) {
    console.error(e);
  } finally {
    await c.end();
  }
}

fixDb().catch(console.error);
