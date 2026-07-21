const fs = require('fs');
let code = fs.readFileSync('src/components/VaccinePackages/VaccinePackageUI.tsx', 'utf8');
code = code.replace(/#00b4d8/g, '#1250dc');
code = code.replace(/#007b9a/g, '#1250dc');
code = code.replace(/#0096c7/g, '#1e3a8a'); // dark blue for hover
code = code.replace(/#e0f7fa/g, '#eff6ff'); // blue-50
fs.writeFileSync('src/components/VaccinePackages/VaccinePackageUI.tsx', code);
console.log('Replaced colors in VaccinePackageUI');
