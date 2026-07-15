import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

function toSlug(str: string) {
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
  return str.replace(/^-+/g, '').replace(/-+$/g, '');
}

function stripHtml(html: string) {
  // 1. Xóa các \r\n thật trong source HTML để tránh ngắt câu ngẫu nhiên
  let text = (html || '').replace(/\r?\n/g, ' ');
  // 2. Chuyển các thẻ block và <br> thành \n
  text = text.replace(/<\/?(?:div|p|h[1-6]|ul|ol|li|table|tr|td|th|tbody|thead|tfoot|blockquote|article|section)[^>]*>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  // 3. Xóa tất cả các thẻ còn lại (span, strong, a, v.v) nhưng không xuống dòng
  text = text.replace(/<[^>]*>/g, '');
  // 4. Giải mã entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&#039;/g, "'")
             .replace(/&#x2F;/gi, "/")
             .replace(/&#x3A;/gi, ":");
  // 5. Chuẩn hóa space
  text = text.replace(/[ \t]+/g, ' ');
  return text;
}

async function parseHtmlToLexical(html: string, payload: any, articleTitle: string) {
  const parts = html.split(/(<img[^>]+>)/gi);
  const children = [];

  for (const part of parts) {
    if (part.toLowerCase().startsWith('<img')) {
      const srcMatch = part.match(/src="([^"]+)"/i);
      if (srcMatch) {
        let src = srcMatch[1];
        if (src.startsWith('/')) src = 'https://ksbtdanang.vn' + src;
        
        const mediaId = await downloadMedia(payload, src, articleTitle);
        if (mediaId) {
          children.push({
            type: "upload",
            relationTo: "media",
            value: mediaId,
            version: 1
          });
        }
      }
    } else {
      const textPart = stripHtml(part);
      if (textPart.trim()) {
        const paragraphs = textPart.split('\n').map(p => p.trim()).filter(p => p !== '');
        for (const p of paragraphs) {
          children.push({
            type: "paragraph",
            format: "justify",
            indent: 0,
            version: 1,
            children: [{ mode: "normal", text: p.substring(0, 10000), type: "text", style: "", detail: 0, format: 0, version: 1 }]
          });
        }
      }
    }
  }
  
  if (children.length === 0) {
    children.push({
      type: "paragraph", format: "justify", indent: 0, version: 1,
      children: [{ mode: "normal", text: " ", type: "text", style: "", detail: 0, format: 0, version: 1 }]
    });
  }

  return {
    root: {
      type: "root", format: "", indent: 0, version: 1, direction: "ltr",
      children: children
    }
  };
}

interface ArticleItem {
  id: number;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  slug: string;
}

async function fetchRssFeed(start: number): Promise<ArticleItem[]> {
  const url = `https://ksbtdanang.vn/news/rss/?start=${start}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } });
  const xml = await res.text();

  const items = xml.split('<item>').slice(1);
  const articles: ArticleItem[] = [];

  for (const item of items) {
    const titleMatch = item.match(/<title>(.*?)<\/title>/s);
    const linkMatch = item.match(/<link>(https?:\/\/ksbtdanang\.vn[^<]*)<\/link>/);
    const descMatch = item.match(/<description>\s*<!\[CDATA\[(.*?)\]\]>/s);
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
    const guidMatch = item.match(/<!\[CDATA\[news_(\d+)\]\]>/);

    if (!titleMatch || !linkMatch) continue;

    const id = guidMatch ? parseInt(guidMatch[1]) : 0;
    const title = titleMatch[1]
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/&#x[\w]+;/g, '').replace(/&#\d+;/g, '').trim();
    const link = linkMatch[1].trim();
    const description = stripHtml(descMatch ? descMatch[1] : '');
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

    const slugMatch = link.match(/\/([^\/]+)-\d+\.html$/);
    const slug = slugMatch ? slugMatch[1] : toSlug(title);

    articles.push({ id, title, link, description, pubDate, slug });
  }

  return articles;
}

async function downloadMedia(payload: any, url: string, altText: string) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());
    const fileName = url.split('/').pop() || 'image.jpg';

    const mediaDoc = await payload.create({
      collection: 'media',
      data: { alt: altText },
      file: {
        data: buffer,
        mimetype: contentType,
        name: fileName.replace(/[^a-zA-Z0-9.\-]/g, '_'),
        size: buffer.byteLength,
      }
    });
    
    return mediaDoc.id;
  } catch (err) {
    console.error('Lỗi tải ảnh:', err);
    return null;
  }
}

async function runBackgroundSync(payload: any, categoryId: string | number) {
  let totalImported = 0;
  let totalSkipped = 0;

  try {
    console.log('[Seed News] Bắt đầu crawl từ ksbtdanang.vn...');

    for (let start = 0; start <= 40; start += 20) {
      const articles = await fetchRssFeed(start);
      if (articles.length === 0) break;

      for (const art of articles) {
        if (!art.slug || !art.title) continue;

        const existing = await payload.find({
          collection: 'articles',
          where: { slug: { equals: art.slug } },
          limit: 1,
        });

        let existingArticle = null;
        if (existing.totalDocs > 0) {
          existingArticle = existing.docs[0];
          if (existingArticle.image) {
            totalSkipped++;
            continue;
          }
        }

        // Fetch HTML trang bài viết để lấy ảnh og:image và content
        let fullText = art.description;
        let imageUrl = null;
        try {
          const res = await fetch(art.link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const html = await res.text();
          
          // Lấy hình ảnh (ưu tiên og:image)
          const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
          if (ogImageMatch) {
            imageUrl = ogImageMatch[1].replace(/&amp;/g, '&');
          } else {
            // Lấy <img> đầu tiên trong news-bodyhtml
            const imgMatch = html.match(/id="news-bodyhtml"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i);
            if (imgMatch) {
              imageUrl = imgMatch[1];
              if (imageUrl.startsWith('/')) {
                imageUrl = 'https://ksbtdanang.vn' + imageUrl;
              }
            }
          }
          
          // Lấy nội dung
        let rawHtml = '';
        const contentMatch = html.match(/id="news-bodyhtml"[^>]*>([\s\S]*?)<div[^>]*class="[^"]*other-news/i)
                          || html.match(/id="news-bodyhtml"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
                          
        if (contentMatch) {
          rawHtml = contentMatch[1];
        }
      } catch (err) {
        console.error("Lỗi crawl chi tiết:", art.link);
      }

      let mediaId = null;
      if (imageUrl) {
        mediaId = await downloadMedia(payload, imageUrl, art.title);
      }

      const lexical = await parseHtmlToLexical(rawHtml || art.description, payload, art.title);

        const articleData = {
          title: art.title,
          publishedAt: art.pubDate,
          slug: art.slug,
          category: categoryId,
          description: art.description.substring(0, 500).replace(/\n/g, ' '),
          content: lexical as any,
          author_name: 'CDC Đà Nẵng',
          views: 0,
          _status: 'published',
          image: mediaId,
        };

        if (existingArticle) {
          await payload.update({
            collection: 'articles',
            id: existingArticle.id,
            data: articleData,
          });
          console.log(`Đã cập nhật: ${art.title} (Image: ${mediaId ? 'OK' : 'None'})`);
        } else {
          await payload.create({
            collection: 'articles',
            data: articleData,
          });
          console.log(`Đã import: ${art.title} (Image: ${mediaId ? 'OK' : 'None'})`);
        }

        totalImported++;
      }

      if (articles.length < 20) break;
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`[Seed News] Hoàn tất. Import: ${totalImported}, Bỏ qua: ${totalSkipped}`);
  } catch (error) {
    console.error('[Seed News] Lỗi crawl:', error);
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

    const categoriesResult = await payload.find({
      collection: 'categories',
      limit: 1,
    });

    const defaultCatId = categoriesResult.docs.length > 0 ? categoriesResult.docs[0].id : 1;

    runBackgroundSync(payload, defaultCatId).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Đã kích hoạt crawl bài viết VÀ TẢI ẢNH ĐẠI DIỆN từ ksbtdanang.vn.',
    });
  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
