import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

// Route công khai - không cần auth, tự thêm CORS cho Zalo Mini App
export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page     = parseInt(searchParams.get('page') || '1', 10);
    const limit    = parseInt(searchParams.get('limit') || '10', 10);
    const search   = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const slugParam = searchParams.get('slug') || '';

    const payload = await getPayload({ config: configPromise });

    // Xây dựng query bằng Local API (bỏ qua network/HTTP hoàn toàn)
    const whereQuery: any = {
      _status: { equals: 'published' }
    };

    if (slugParam) {
      whereQuery.slug = { equals: slugParam };
    }
    if (search) {
      whereQuery.title = { like: search };
    }
    if (category) {
      whereQuery['category.slug'] = { equals: category };
    }

    const data = await payload.find({
      collection: 'articles',
      where: whereQuery,
      limit,
      page,
      sort: '-publishedAt',
      depth: 1,
    });

    const baseUrl = 'https://ecdc.vnos.org';

    // Hàm parse Lexical JSON sang HTML cơ bản
    const lexicalToHtml = (node: any): string => {
      if (!node) return '';
      if (node.type === 'text') {
        let text = node.text || '';
        if (node.format & 1) text = `<strong>${text}</strong>`;
        if (node.format & 2) text = `<em>${text}</em>`;
        if (node.format & 8) text = `<u>${text}</u>`;
        return text;
      }
      if (node.type === 'linebreak') return '<br />';
      if (node.type === 'paragraph') return `<p style="margin-bottom:12px;">${(node.children || []).map(lexicalToHtml).join('')}</p>`;
      if (node.type === 'heading') return `<${node.tag} style="margin-top:16px;margin-bottom:12px;">${(node.children || []).map(lexicalToHtml).join('')}</${node.tag}>`;
      if (node.type === 'list') return `<${node.tag} style="margin-left:20px;margin-bottom:12px;">${(node.children || []).map(lexicalToHtml).join('')}</${node.tag}>`;
      if (node.type === 'listitem') return `<li>${(node.children || []).map(lexicalToHtml).join('')}</li>`;
      if (node.type === 'link') return `<a href="${node.fields?.url}" target="_blank" style="color:#00a651;">${(node.children || []).map(lexicalToHtml).join('')}</a>`;
      if (node.type === 'upload' && node.relationTo === 'media') {
        const url = node.value?.url || '';
        const imgUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;
        return `<img src="${imgUrl}" style="width:100%; border-radius:8px; margin-bottom:12px;" />`;
      }
      if (node.children) return (node.children || []).map(lexicalToHtml).join('');
      return '';
    };

    const docs = (data.docs || []).map((a: any) => {
      const imgPath = a.image?.sizes?.card?.url || a.image?.url || '';
      const imageUrl = imgPath.startsWith('/') ? `${baseUrl}${imgPath}` : imgPath;
      
      const contentHtml = a.content?.root ? lexicalToHtml(a.content.root) : '';

      return {
        id:          a.id,
        title:       a.title,
        slug:        a.slug,
        description: a.description || '',
        imageUrl,
        contentHtml,
        category:    typeof a.category === 'object' ? a.category?.name : a.category,
        publishedAt: a.publishedAt,
      };
    });

    return NextResponse.json(
      { docs, totalDocs: data.totalDocs, totalPages: data.totalPages, page: data.page },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('Payload Local API error:', err);
    return NextResponse.json({ error: 'Server Error: ' + err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
