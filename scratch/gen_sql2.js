const fs = require('fs');
const path = require('path');

const csvPath = 'C:\\Users\\SingPC\\.gemini\\antigravity\\brain\\9a9355f7-9519-4b9d-bec4-9156a17eb635\\scratch\\banggia_vacxin.csv';
const raw = fs.readFileSync(csvPath, 'utf-8');

const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
lines.shift(); // header

let sql = `
  // ====================================================
  // BATCH: Insert initial vaccine data
  // ====================================================
  \`INSERT INTO "vaccines" ("name", "disease", "target_group", "price", "origin", "status", "notes") VALUES
`;

const values = [];
for (const line of lines) {
  const row = [];
  const matches = [...line.matchAll(/"(.*?)"/g)];
  for(let match of matches) {
    row.push(match[1]);
  }
  if (row.length < 9) continue;
  
  const disease = row[1].replace(/'/g, "''");
  let name = row[2].replace(/'/g, "''");
  if (row[5] && row[5].trim() !== '') {
      name += ` (${row[5].replace(/'/g, "''")})`;
  }
  const origin = row[3].replace(/'/g, "''");
  const status = row[4] === 'Còn' ? 'in_stock' : 'out_of_stock';
  const price = parseInt(row[7].replace(/[,.]/g, '')) || 0;
  
  let notes = (row[9] || '').replace(/'/g, "''");
  const price2Str = row[8] ? row[8].trim().replace(/'/g, "''") : '';
  if (price2Str && price2Str !== '' && price2Str !== '-' && price2Str !== row[7]) {
      notes = `Giá mũi 2+: ${price2Str} VNĐ. ` + notes;
  }
  
  values.push(`('${name}', '${disease}', '', ${price}, '${origin}', '${status}', '${notes}')`);
}

sql += '    ' + values.join(',\n    ') + ` ON CONFLICT DO NOTHING;\`,`;

fs.writeFileSync(path.join(__dirname, 'insert_vaccines_code.txt'), sql);
console.log('SQL generated to scratch/insert_vaccines_code.txt');
