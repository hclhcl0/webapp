import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URI, ssl: false });
const client = await pool.connect();

// Danh sách các FK constraints và tables cần xóa
const constraints = [
  { table: 'payload_locked_documents_rels', constraint: 'payload_locked_documents_rels_zalo_followers_fk' },
  { table: 'payload_locked_documents_rels', constraint: 'payload_locked_documents_rels_zalo_message_logs_fk' },
  { table: 'payload_locked_documents_rels', constraint: 'payload_locked_documents_rels_zalo_staff_links_fk' },
  { table: 'payload_locked_documents_rels', constraint: 'payload_locked_documents_rels_zalo_broadcasts_fk' },
  { table: 'payload_locked_documents_rels', constraint: 'payload_locked_documents_rels_zalo_system_configs_fk' },
];

const columns = [
  { table: 'payload_locked_documents_rels', column: 'zalo_followers_id' },
  { table: 'payload_locked_documents_rels', column: 'zalo_message_logs_id' },
  { table: 'payload_locked_documents_rels', column: 'zalo_staff_links_id' },
  { table: 'payload_locked_documents_rels', column: 'zalo_broadcasts_id' },
  { table: 'payload_locked_documents_rels', column: 'zalo_system_configs_id' },
];

const tables = [
  'zalo_followers',
  'zalo_message_logs', 
  'zalo_staff_links',
  'zalo_broadcasts',
  'zalo_system_configs',
  // rels tables
  'zalo_followers_rels',
  'zalo_message_logs_rels',
  'zalo_staff_links_rels',
];

// Drop FK constraints
for (const { table, constraint } of constraints) {
  try {
    await client.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS "${constraint}"`);
    console.log(`✓ Dropped constraint: ${constraint}`);
  } catch (e) {
    console.log(`⚠ ${constraint}: ${e.message.substring(0, 60)}`);
  }
}

// Drop columns
for (const { table, column } of columns) {
  try {
    await client.query(`ALTER TABLE ${table} DROP COLUMN IF EXISTS "${column}"`);
    console.log(`✓ Dropped column: ${table}.${column}`);
  } catch (e) {
    console.log(`⚠ ${table}.${column}: ${e.message.substring(0, 60)}`);
  }
}

// Drop tables
for (const table of tables) {
  try {
    await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    console.log(`✓ Dropped table: ${table}`);
  } catch (e) {
    console.log(`⚠ ${table}: ${e.message.substring(0, 60)}`);
  }
}

// Xóa các global tables liên quan đến Zalo
const globalTables = [
  'zalo_settings_ui',
  'salary_email',
];
for (const table of globalTables) {
  try {
    await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    console.log(`✓ Dropped global table: ${table}`);
  } catch (e) {
    console.log(`⚠ ${table}: ${e.message.substring(0, 60)}`);
  }
}

client.release();
await pool.end();
console.log('\n✅ Hoàn tất dọn dẹp database.');
