const sharp = require('sharp');

async function generate() {
  const input = 'D:/CDC/webcq/next-frontend/public/logo.png';

  const sizes = [
    // Favicon sizes
    { size: 16,  out: 'D:/CDC/webcq/next-frontend/public/favicon-16x16.png' },
    { size: 32,  out: 'D:/CDC/webcq/next-frontend/public/favicon-32x32.png' },
    // Apple touch icon (iOS)
    { size: 180, out: 'D:/CDC/webcq/next-frontend/public/apple-touch-icon.png' },
    // PWA icons
    { size: 192, out: 'D:/CDC/webcq/next-frontend/public/icon-192x192.png' },
    { size: 512, out: 'D:/CDC/webcq/next-frontend/public/icon-512x512.png' },
    // Maskable icon (Android adaptive icon - extra padding)
    { size: 512, out: 'D:/CDC/webcq/next-frontend/public/icon-512x512-maskable.png', padding: 60 },
  ];

  for (const s of sizes) {
    const innerSize = s.padding ? s.size - s.padding * 2 : s.size;
    if (s.padding) {
      // Create white background + centered logo with padding
      await sharp(input)
        .resize(innerSize, innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .toBuffer()
        .then(buf =>
          sharp({
            create: {
              width: s.size,
              height: s.size,
              channels: 4,
              background: { r: 255, g: 255, b: 255, alpha: 1 },
            },
          })
            .composite([{ input: buf, gravity: 'center' }])
            .png()
            .toFile(s.out)
        );
    } else {
      await sharp(input)
        .resize(s.size, s.size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .toFile(s.out);
    }
    console.log(`✅ Generated: ${s.out}`);
  }

  // Also overwrite the next.js app/favicon.ico via generating a 32x32 PNG copy
  await sharp(input)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFile('D:/CDC/webcq/next-frontend/favicon-32.png');
  console.log('✅ Generated favicon-32.png (copy to app/favicon.ico manually or use next.js icon route)');
  console.log('\n🎉 All icons generated!');
}

generate().catch(console.error);
