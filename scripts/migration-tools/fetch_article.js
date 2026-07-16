const cheerio = require('cheerio');
fetch('https://ecdc.vnos.org/bai-viet/nang-cao-nang-luc-quan-ly-ca-benh-sot-ret-duy-tri-thanh-qua-loai-tru-benh-tai-da-nang')
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    console.log($('.rich-text').html() || $('article').text());
  });
