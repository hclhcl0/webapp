const fs = require('fs');
const { Pool } = require('pg');

const csvPath = 'C:\\Users\\SingPC\\.gemini\\antigravity\\brain\\9a9355f7-9519-4b9d-bec4-9156a17eb635\\scratch\\banggia_vacxin.csv';
const dbUri = 'postgres://postgres:123456@127.0.0.1:5432/webcq';

async function main() {
  const pool = new Pool({ connectionString: dbUri });
  const raw = fs.readFileSync(csvPath, 'utf-8');
  
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  lines.shift(); // header
  
  await pool.query('TRUNCATE TABLE vaccines RESTART IDENTITY CASCADE');
  
  for (const line of lines) {
    const row = [];
    const matches = [...line.matchAll(/"(.*?)"/g)];
    for(let match of matches) {
      row.push(match[1]);
    }
    
    if (row.length < 9) continue;
    
    // CSV mapping
    const disease = row[1];
    let name = row[2];
    if (row[5] && row[5].trim() !== '') {
        name += ` (${row[5]})`;
    }
    const origin = row[3];
    const status = row[4] === 'Còn' ? 'in_stock' : 'out_of_stock';
    
    const price = parseInt(row[7].replace(/[,.]/g, '')) || 0;
    
    let notes = row[9] || '';
    const price2Str = row[8] ? row[8].trim() : '';
    if (price2Str && price2Str !== '' && price2Str !== '-' && price2Str !== row[7]) {
        notes = `Giá mũi 2+: ${price2Str} VNĐ. ` + notes;
    }
    
    const target_group = '';
    
    await pool.query(`
      INSERT INTO vaccines (name, disease, target_group, price, origin, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [name, disease, target_group, price, origin, status, notes]);
  }
  
  console.log('Migrated ' + lines.length + ' rows successfully!');
  pool.end();
}

main().catch(console.error);
