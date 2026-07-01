const fs = require('fs');
let content = fs.readFileSync('D:/CDC/webcq/next-frontend/src/payload.config.ts', 'utf8');
content = content.replace(/\.ts'/g, "'");
fs.writeFileSync('D:/CDC/webcq/next-frontend/src/payload.config.ts', content);
console.log('Fixed extensions in payload.config.ts');
