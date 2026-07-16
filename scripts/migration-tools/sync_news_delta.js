const https = require('https');
const { Client } = require('pg');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function toSlug(str) {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');
  str = str.replace(/([^0-9a-z-\s])/g, '');
  str = str.replace(/(\s+)/g, '-');
  str = str.replace(/^-+/g, '').replace(/-+$/g, '');
  return str;
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function createLexicalJson(text) {
  return {
    root: {
      type: "root", format: "", indent: 0, version: 1,
      direction: "ltr",
      children: [{
        type: "paragraph", format: "", indent: 0, version: 1,
        children: [{ mode: "normal", text: text.substring(0, 8000), type: "text", style: "", detail: 0, format: 0, version: 1 }]
      }]
    }
  };
}

// Lấy tất cả bài từ ID 1596 đến 2211 qua từng trang news
async function fetchAllNewArticles() {
  const articles = [];
  // Trang web có dạng: /news/page-N/ hoặc chỉ list theo thứ tự
  // Lấy qua RSS nhiều trang, hoặc crawl trực tiếp từng URL theo pattern
  // URL bài viết: https://ksbtdanang.vn/news/{category}/{slug}-{id}.html
  // Dùng RSS feed để lấy 20 bài mới nhất, tồn tại nhiều page

  // Thử trực tiếp API news JSON nếu có, nếu không thì parse RSS nhiều page
  // Trang NukeViet thường có: /news/?json=1 hoặc /news/rss/?start=N
  
  for (let start = 0; start <= 200; start += 20) {
    const url = `https://ksbtdanang.vn/news/rss/?start=${start}`;
    console.log(`  Đang lấy: ${url}`);
    try {
      const xml = await fetchUrl(url);
      
      const items = xml.split('<item>').slice(1);
      if (items.length === 0) break;
      
      for (const item of items) {
        const titleMatch = item.match(/<title>(.*?)<\/title>/s);
        const linkMatch = item.match(/<link>(https?:\/\/ksbtdanang\.vn[^<]*)<\/link>/);
        const descMatch = item.match(/<description>\s*<!\[CDATA\[(.*?)\]\]>/s);
        const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
        const guidMatch = item.match(/<!\[CDATA\[news_(\d+)\]\]>/);

        if (!titleMatch || !linkMatch) continue;

        const id = guidMatch ? parseInt(guidMatch[1]) : 0;
        // Chỉ lấy bài từ ID 1596 trở đi (mới hơn lần migrate trước)
        if (id > 0 && id <= 1595) continue;

        const title = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x[\w]+;/g, '').trim();
        const link = linkMatch[1].trim();
        const description = stripHtml(descMatch ? descMatch[1] : '').substring(0, 300);
        const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();
        
        // Trích xuất slug từ URL
        const slugMatch = link.match(/\/([^\/]+)-\d+\.html$/);
        const slug = slugMatch ? slugMatch[1] : toSlug(title);

        // Trích xuất catid từ URL category path
        // Bỏ qua, để default
        
        articles.push({ id, title, link, description, pubDate, slug });
      }
      
      // Nếu RSS trả về ít hơn 20 thì hết rồi
      if (items.length < 20) break;
      
      await new Promise(r => setTimeout(r, 300)); // Lịch sự với server
    } catch (e) {
      console.error(`  Lỗi lấy trang start=${start}:`, e.message);
      break;
    }
  }
  
  return articles;
}

// Lấy nội dung chi tiết 1 bài
async function fetchArticleContent(url) {
  try {
    const html = await fetchUrl(url);
    // NukeViet article body thường nằm trong div.news-content hoặc div.article-content
    const bodyMatch = html.match(/<div[^>]*class="[^"]*(?:news-content|article-content|content-detail|newsdetail-content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
                   || html.match(/<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div/i);
    if (bodyMatch) {
      return stripHtml(bodyMatch[1]);
    }
    return '';
  } catch (e) {
    return '';
  }
}

async function run() {
  console.log("1. Kết nối PostgreSQL...");
  const pgClient = new Client({ connectionString: 'postgresql://postgres:123456@127.0.0.1:5432/webcq' });
  await pgClient.connect();

  try {
    console.log("2. Lấy danh sách chuyên mục hiện có...");
    const { rows: pgCats } = await pgClient.query("SELECT id, slug, name FROM categories ORDER BY id LIMIT 1");
    const defaultCatId = pgCats.length > 0 ? pgCats[0].id : 1;

    console.log("3. Crawl bài mới từ ksbtdanang.vn...");
    const newArticles = await fetchAllNewArticles();
    console.log(`   Tìm thấy ${newArticles.length} bài mới (ID > 1595)`);

    if (newArticles.length === 0) {
      console.log("Không có bài mới nào cần import.");
      return;
    }

    // Lấy max ID hiện tại
    const { rows: maxIdRow } = await pgClient.query("SELECT MAX(id) as maxid FROM articles");
    let currentId = (parseInt(maxIdRow[0].maxid) || 0) + 1;

    let imported = 0;
    for (const art of newArticles) {
      // Check slug trùng
      const { rows: exist } = await pgClient.query("SELECT id FROM articles WHERE slug = $1", [art.slug]);
      if (exist.length > 0) {
        console.log(`  -> Bỏ qua (đã có): ${art.title}`);
        continue;
      }

      // Lấy nội dung chi tiết (tùy chọn, có thể bỏ để nhanh hơn)
      // const body = await fetchArticleContent(art.link);
      const lexical = createLexicalJson(art.description);

      console.log(`  -> Import [${art.id}]: ${art.title}`);

      await pgClient.query(`
        INSERT INTO articles (id, title, published_at, slug, category_id, description, content, author_name, views, updated_at, created_at, _status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), 'published')
      `, [currentId++, art.title, art.pubDate, art.slug, defaultCatId, art.description, lexical, 'CDC Đà Nẵng', 0]);

      imported++;
    }

    await pgClient.query("SELECT setval('articles_id_seq', (SELECT MAX(id) FROM articles))");
    console.log(`\nSUCCESS! Đã import ${imported} bài mới từ ksbtdanang.vn`);
  } finally {
    await pgClient.end();
  }
}

run().catch(console.error);
