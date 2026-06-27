import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('payload-data.db', { readonly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

const data = {};

for (const table of tables) {
  if (table.name.startsWith('sqlite_') || table.name === '__drizzle_migrations') continue;
  
  const rows = db.prepare(`SELECT * FROM "${table.name}"`).all();
  data[table.name] = rows;
}

db.close();

fs.writeFileSync('db_export.json', JSON.stringify(data, null, 2));
console.log(`Exported ${Object.keys(data).length} tables to db_export.json`);
