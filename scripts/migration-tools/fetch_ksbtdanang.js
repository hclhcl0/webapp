const cheerio = require('cheerio');
fetch('https://ksbtdanang.vn/news/suc-khoe/nang-cao-nang-luc-quan-ly-ca-benh-sot-ret-duy-tri-thanh-qua-loai-tru-benh-tai-da-nang-2165.html')
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    console.log($('#news-bodyhtml').html());
  });
