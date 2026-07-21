const https = require('https');

https.get('https://www.youtube.com/watch?v=dQw4w9WgXcQ', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const titleMatch = data.match(/<meta name="title" content="([^"]+)">/);
    const descMatch = data.match(/<meta name="description" content="([^"]+)">/);
    const ogDescMatch = data.match(/<meta property="og:description" content="([^"]+)">/);
    
    console.log('Title:', titleMatch ? titleMatch[1] : 'Not found');
    console.log('Desc:', descMatch ? descMatch[1] : 'Not found');
    console.log('OG Desc:', ogDescMatch ? ogDescMatch[1] : 'Not found');
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
