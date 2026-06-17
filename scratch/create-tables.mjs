import pg from 'pg';
const { Pool } = pg;

const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
CREATE TABLE IF NOT EXISTS "zalo_settings_ui" (
	"id" serial PRIMARY KEY NOT NULL,
	"dummy" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "salary_email_ui" (
	"id" serial PRIMARY KEY NOT NULL,
	"dummy" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
    `);
    console.log('Created tables successfully.');
    
    // Also insert the initial row if it doesn't exist so Payload doesn't crash
    await client.query(`
      INSERT INTO "zalo_settings_ui" ("id", "dummy") VALUES (1, 'init') ON CONFLICT DO NOTHING;
      INSERT INTO "salary_email_ui" ("id", "dummy") VALUES (1, 'init') ON CONFLICT DO NOTHING;
    `);
    console.log('Inserted default rows.');
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}
run();
