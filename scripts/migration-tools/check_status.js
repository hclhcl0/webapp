const { Client } = require('pg');

async function check() {
  const c = new Client('postgresql://postgres:123456@127.0.0.1:5432/webcq');
  await c.connect();
  try {
    // 14 bài mới nhất vừa import từ ksbtdanang.vn (dựa trên created_at)
    const r = await c.query(`
      SELECT a.id, a.title, a.slug, a.published_at, a.created_at, cat.name as cat_name
      FROM articles a
      LEFT JOIN categories cat ON cat.id = a.category_id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);

    console.log('=== 20 BÀI MỚI NHẤT TRONG DB (theo ngày tạo) ===');
    r.rows.forEach(row => {
      console.log(`  [${row.cat_name}] ${row.published_at?.toLocaleDateString?.('vi-VN') || row.published_at} | ${row.title}`);
    });

    // Kiểm tra bài có published_at từ tháng 7/2026
    const r2 = await c.query(`
      SELECT COUNT(*) as cnt FROM articles WHERE published_at >= '2026-07-01'
    `);
    console.log(`\nBài có published_at >= 01/07/2026: ${r2.rows[0].cnt}`);

    // Kiểm tra phân bố category
    const r3 = await c.query(`
      SELECT cat.name, COUNT(*) as cnt
      FROM articles a
      JOIN categories cat ON cat.id = a.category_id
      GROUP BY cat.name ORDER BY cnt DESC LIMIT 10
    `);
    console.log('\n=== PHÂN BỐ THEO CHUYÊN MỤC ===');
    r3.rows.forEach(row => console.log(`  ${row.name}: ${row.cnt} bài`));

  } finally {
    await c.end();
  }
}
check().catch(console.error);
