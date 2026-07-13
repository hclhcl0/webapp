const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgres://postgres:123456@127.0.0.1:5432/webcq",
});

async function main() {
  try {
    const res = await pool.query(`SELECT title, content FROM articles WHERE title ILIKE '%Bình dân học vụ%' LIMIT 1`);
    if (res.rows.length > 0) {
      const content = res.rows[0].content;
      console.log(JSON.stringify(content, null, 2));
    } else {
      console.log("No article found");
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

main();
