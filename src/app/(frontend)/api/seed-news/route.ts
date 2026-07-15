import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import fs from 'fs';
import path from 'path';

function createLexicalJson(htmlContent: string) {
  const text = (htmlContent || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().substring(0, 5000);
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
              text: text,
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

// Hàm chạy ngầm
async function runBackgroundSeed(payload: any, newsData: any[], pgCats: any[]) {
  try {
    let importedCount = 0;
    console.log(`[Seed News] Start syncing ${newsData.length} articles...`);

    // Lưu danh mục id vào 1 map để tìm nhanh
    const catMap = new Map();
    for (const c of pgCats) {
      catMap.set(c.id, c.id); // Payload ID
    }

    for (const item of newsData) {
      if (!item.slug) continue;

      // Tìm xem bài viết đã tồn tại chưa
      const existing = await payload.find({
        collection: 'articles',
        where: { slug: { equals: item.slug } },
        limit: 1,
      });

      if (existing.totalDocs > 0) {
        continue;
      }

      const lexicalContent = createLexicalJson(item.bodyhtml);
      const publDate = item.publtime ? new Date(item.publtime * 1000).toISOString() : new Date().toISOString();
      const desc = item.description || '';
      
      let catId = item.catid;
      let mappedCatId = pgCats.length > 0 ? pgCats[0].id : 1;
      
      // Ở DB PostgreSQL cũ, catid Nukeviet có mapping không?
      // Ta lấy luôn catId cũ nếu tồn tại trong PG, nếu không thì lấy mặc định.
      if (catId && catMap.has(String(catId))) {
        mappedCatId = String(catId);
      } else if (catId && catMap.has(Number(catId))) {
        mappedCatId = Number(catId);
      }

      await payload.create({
        collection: 'articles',
        data: {
          title: item.title,
          publishedAt: publDate,
          slug: item.slug,
          category: mappedCatId,
          description: desc,
          content: lexicalContent as any,
          author_name: 'Quản trị viên',
          views: item.hitstotal || 0,
          _status: 'published'
        },
      });

      importedCount++;
      if (importedCount % 50 === 0) {
        console.log(`[Seed News] Đã import ${importedCount} bài...`);
      }
    }
    console.log(`[Seed News] Hoàn thành. Đã import thêm ${importedCount} bài mới.`);
  } catch (error) {
    console.error("[Seed News] Lỗi chạy ngầm:", error);
  }
}

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    if (secret !== 'vnos-cdc-seed') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jsonPath = path.join(process.cwd(), 'src', 'app', '(frontend)', 'api', 'seed-news', 'news_data.json');
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'File news_data.json not found' }, { status: 404 });
    }

    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const newsData = JSON.parse(raw);

    // Lấy trước toàn bộ Categories để map
    const categoriesResult = await payload.find({
      collection: 'categories',
      limit: 1000,
    });
    const pgCats = categoriesResult.docs;

    // Chạy tiến trình ngầm (không await)
    runBackgroundSeed(payload, newsData, pgCats).catch(console.error);

    return NextResponse.json({ 
      success: true, 
      message: `Đã kích hoạt chạy ngầm (Background Task). Hệ thống đang kiểm tra và import ${newsData.length} bài viết. Dữ liệu sẽ xuất hiện dần trên website.` 
    });
  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
