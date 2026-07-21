const fs = require('fs');
const content = fs.readFileSync('src/components/VaccinePackages/VaccineMainUI.tsx', 'utf8');
const fixed = content.replace(/\\`/g, '`');
fs.writeFileSync('src/components/VaccinePackages/VaccineMainUI.tsx', fixed);
console.log('Fixed');
