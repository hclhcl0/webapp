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

    const payload = await getPayload({ config: configPromise });

    // Xây dựng query bằng Local API (bỏ qua network/HTTP hoàn toàn)
    const whereQuery: any = {
      _status: { equals: 'published' }
    };

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

    const docs = (data.docs || []).map((a: any) => {
      const imgPath = a.image?.sizes?.card?.url || a.image?.url || '';
      const imageUrl = imgPath.startsWith('/') ? `${baseUrl}${imgPath}` : imgPath;
      return {
        id:          a.id,
        title:       a.title,
        slug:        a.slug,
        description: a.description || '',
        imageUrl,
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
