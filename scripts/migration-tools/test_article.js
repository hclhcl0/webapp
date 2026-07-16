const cheerio = require('cheerio');
async function test() {
  const url = 'https://ksbtdanang.vn/news/dao-tao/nang-cao-nang-luc-quan-ly-ca-benh-sot-ret-duy-tri-thanh-qua-loai-tru-benh-tai-da-nang-2185.html';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  const rawHtml = $('#news-bodyhtml').html();
  console.log('LENGTH:', rawHtml ? rawHtml.length : 0);
  if (rawHtml) console.log(rawHtml.substring(0, 500));
}
test();
