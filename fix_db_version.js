import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
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
