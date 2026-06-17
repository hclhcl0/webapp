import pg from 'pg';
const { Pool } = pg;

const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || "postgres://postgres:123456@127.0.0.1:5433/webcq";

const pool = new Pool({
  connectionString: dbUrl,
});

async function dropOldTables() {
  const client = await pool.connect();
  try {
    const tables = [
      '"Admin"', '"Follower"', '"Appointment"', '"TestResult"', '"ServicePrice"', 
      '"NewsArticle"', '"SystemConfig"', '"MessageLog"', '"StaffZaloLink"', 
      '"AiKnowledge"', '"GeminiApiKey"', '"GroqApiKey"', '"_prisma_migrations"', '"ZaloBroadcast"',
      '"SystemSetting"', '"ai_settings"'
    ];
    
    for (const table of tables) {
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
      console.log(`Dropped ${table}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

dropOldTables();
