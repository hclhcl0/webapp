const { Client } = require('pg');
const format = require('pg-format');
const fs = require('fs');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URI });
  await client.connect();

  const data = JSON.parse(fs.readFileSync('db_export.json', 'utf8'));

  const res = await client.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
  `);
  
  const schema = {};
  for (const row of res.rows) {
    if (!schema[row.table_name]) schema[row.table_name] = {};
    schema[row.table_name][row.column_name] = row.data_type;
  }

  await client.query("SET session_replication_role = 'replica';");

  for (const [table, rows] of Object.entries(data)) {
    if (rows.length === 0) continue;
    if (!schema[table]) {
      console.log(`Skipping table ${table} because it does not exist in Postgres`);
      continue;
    }

    const columns = Object.keys(rows[0]).filter(col => schema[table][col]);
    if (columns.length === 0) continue;

    const values = rows.map(row => {
      return columns.map(col => {
        let val = row[col];
        if (val === null || val === undefined) return null;
        
        const type = schema[table][col];
        if (type === 'boolean') {
          return val === 1 || val === '1' || val === true || val === 'true';
        }
        if (type === 'jsonb' || type === 'json') {
          if (typeof val === 'string') {
            try { return JSON.parse(val); } catch(e) { return val; }
          }
          return JSON.stringify(val);
        }
        return val;
      });
    });

    try {
      const CHUNK_SIZE = 500;
      for (let i = 0; i < values.length; i += CHUNK_SIZE) {
        const chunk = values.slice(i, i + CHUNK_SIZE);
        const query = format('INSERT INTO %I (%I) VALUES %L ON CONFLICT DO NOTHING', table, columns, chunk);
        await client.query(query);
      }
      console.log(`Imported ${values.length} rows into ${table}`);
      
      if (schema[table]['id'] === 'integer' || schema[table]['id'] === 'bigint') {
         await client.query(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id),0) + 1, false) FROM "${table}"`);
      }
    } catch (e) {
      console.error(`Error importing table ${table}:`, e.message);
    }
  }

  await client.query("SET session_replication_role = 'origin';");
  await client.end();
}

run().catch(console.error);
