const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({ connectionString: 'postgres://postgres:123456@127.0.0.1:5432/webcq' });
  await client.connect();

  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);

  const data = {};
  for (const row of tablesRes.rows) {
    const table = row.table_name;
    const res = await client.query(`SELECT * FROM "${table}"`);
    data[table] = res.rows;
  }

  fs.writeFileSync('db_export.json', JSON.stringify(data, null, 2));
  console.log(`Exported ${Object.keys(data).length} tables from local Postgres to db_export.json`);

  await client.end();
}

run().catch(console.error);
