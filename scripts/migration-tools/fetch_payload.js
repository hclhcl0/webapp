const cheerio = require('cheerio');
fetch('https://ecdc.vnos.org/api/articles?where[slug][equals]=nang-cao-nang-luc-quan-ly-ca-benh-sot-ret-duy-tri-thanh-qua-loai-tru-benh-tai-da-nang')
  .then(r => r.json())
  .then(data => {
    console.log(JSON.stringify(data.docs[0].content, null, 2));
  });
