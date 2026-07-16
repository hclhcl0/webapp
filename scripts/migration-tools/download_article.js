const fs = require('fs');
fetch('https://ksbtdanang.vn/news/suc-khoe/lop-tap-huan-nang-cao-nang-luc-quan-ly-ca-benh-sot-ret-cho-can-bo-y-te-co-so-2211.html')
  .then(r => r.text())
  .then(html => {
    fs.writeFileSync('temp_article.html', html);
    console.log("Saved temp_article.html");
  });
