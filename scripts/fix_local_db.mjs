import pg from 'pg';
const { Pool } = pg;

const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || 'postgres://postgres:123456@127.0.0.1:5432/webcq';

const pool = new Pool({
  connectionString: dbUrl,
});

const cols = [
  'departments_id',
  'users_id',
  'media_id',
  'categories_id',
  'tags_id',
  'articles_id',
  'pages_id',
  'banners_id',
  'documents_id',
  'document_signers_id',
  'work_schedules_id',
  'video_channels_id',
  'videos_id',
  'form_submissions_id',
  'org_units_id',
  'ai_knowledge_id',
  'api_keys_id',
  'procurements_id',
  'vaccines_id',
  'vaccine_packages_id',
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connecting to Postgres at', dbUrl, '...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
        "id" serial PRIMARY KEY,
        "global_slug" varchar,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer,
        "path" varchar
      );
    `);

    for (const col of cols) {
      await client.query(`
        DO $$ BEGIN
          ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "${col}" integer;
        EXCEPTION WHEN duplicate_column THEN null;
        END $$;
      `);
    }

    console.log('✅ Successfully added all missing relationship columns to payload_locked_documents_rels!');
  } catch (err) {
    console.error('❌ Error updating database:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
