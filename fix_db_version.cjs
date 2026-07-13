const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgres://postgres:123456@127.0.0.1:5432/webcq",
});

async function main() {
  try {
    console.log("Adding version_is_pinned column to _articles_v...");
    await pool.query(`ALTER TABLE "_articles_v" ADD COLUMN IF NOT EXISTS "version_is_pinned" boolean DEFAULT false`);
    console.log("Column version_is_pinned added successfully!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

main();
