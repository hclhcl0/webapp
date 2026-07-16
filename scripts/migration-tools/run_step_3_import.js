const fs = require('fs');
const { Client } = require('pg');

function createLexicalJson(htmlContent) {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          children: [
            {
              mode: "normal",
              text: (htmlContent||'').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().substring(0, 5000), 
              type: "text",
              style: "",
              detail: 0,
              format: 0,
              version: 1
            }
          ]
        }
      ],
      direction: "ltr"
    }
  };
}

async function run() {
  console.log("1. Kết nối PostgreSQL (Đích)...");
  const pgClient = new Client({ connectionString: 'postgresql://postgres:123456@127.0.0.1:5432/webcq' });
  await pgClient.connect();

  try {
    const newsData = JSON.parse(fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\news_data.json', 'utf8'));
    console.log(`- Đã tải ${newsData.length} bài viết từ file JSON.`);

    const { rows: pgCats } = await pgClient.query("SELECT id, slug, name FROM categories");
    let importedCount = 0;
    
    const { rows: maxIdRow } = await pgClient.query("SELECT MAX(id) as maxid FROM articles");
    let currentId = (maxIdRow[0].maxid || 0) + 1;

    for (const item of newsData) {
      if (!item.slug) continue;
      
      const { rows: existing } = await pgClient.query("SELECT id FROM articles WHERE slug = $1", [item.slug]);
      if (existing.length > 0) {
        continue;
      }

      const lexicalContent = createLexicalJson(item.bodyhtml);
      const publDate = item.publtime ? new Date(item.publtime * 1000).toISOString() : new Date().toISOString();
      const desc = item.description || '';
      
      let catId = item.catid;
      let mappedCatId = 1;
      if (catId && pgCats.find(c => c.id == catId)) {
        mappedCatId = catId;
      } else if (pgCats.length > 0) {
        mappedCatId = pgCats[0].id;
      }
      
      if (importedCount % 100 === 0) {
         console.log(`  -> Đang import bài thứ ${importedCount}...`);
      }
      
      await pgClient.query(`
        INSERT INTO articles (id, title, published_at, slug, category_id, description, content, author_name, views, updated_at, created_at, _status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), 'published')
      `, [
        currentId++,
        item.title,
        publDate,
        item.slug,
        mappedCatId,
        desc,
        lexicalContent,
        'Quản trị viên',
        item.hitstotal || 0
      ]);
      
      importedCount++;
    }

    await pgClient.query("SELECT setval('articles_id_seq', (SELECT MAX(id) FROM articles))");
    console.log(`SUCCESS! Đã cập nhật ${importedCount} bài viết mới.`);
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await pgClient.end();
  }
}

run();
