const sharp = require('sharp');
const fs = require('fs');

async function generate() {
  const input = 'D:/CDC/webcq/next-frontend/public/logo.png';
  
  // 192x192
  await sharp(input)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFile('D:/CDC/webcq/next-frontend/public/icon-192x192.png');
    
  // 512x512
  await sharp(input)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFile('D:/CDC/webcq/next-frontend/public/icon-512x512.png');
    
  console.log('Icons generated successfully.');
}
generate();
