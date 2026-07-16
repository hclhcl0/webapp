const fs = require('fs');

const csvPath = 'C:\\Users\\SingPC\\.gemini\\antigravity\\brain\\9a9355f7-9519-4b9d-bec4-9156a17eb635\\scratch\\banggia_vacxin.csv';
const raw = fs.readFileSync(csvPath, 'utf-8');

const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
lines.shift(); // header

const result = [];
for (const line of lines) {
  const row = [];
  const matches = [...line.matchAll(/"(.*?)"/g)];
  for(let match of matches) {
    row.push(match[1]);
  }
  
  if (row.length < 9) continue;
  
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
  
  result.push({
    name,
    disease,
    origin,
    status,
    price,
    notes,
    targetGroup: ''
  });
}

fs.writeFileSync('scratch/vaccines.json', JSON.stringify(result, null, 2));
console.log('Saved to scratch/vaccines.json');
