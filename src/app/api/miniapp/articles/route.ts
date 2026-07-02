import { NextResponse } from 'next/server';

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
  const { searchParams } = new URL(request.url);
  const page     = searchParams.get('page')     || '1';
  const limit    = searchParams.get('limit')    || '10';
  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';

  const params = new URLSearchParams({
    'where[_status][equals]': 'published',
    'limit': limit,
    'page': page,
    'sort': '-publishedAt',
    'depth': '1',
  });

  if (search) {
    params.set('where[or][0][title][like]', search);
  }
  if (category) {
    params.set('where[category.slug][equals]', category);
  }

  try {
    const baseUrl = 'http://localhost:3000'; // Luôn dùng localhost để gọi nội bộ không bị lỗi SSL/DNS
    const res = await fetch(`${baseUrl}/api/articles?${params}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Lỗi lấy bài viết', status: res.status }, { status: 502, headers: CORS_HEADERS });
    }

    const data = await res.json();

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
    console.error('Fetch error:', err);
    return NextResponse.json({ error: 'Server Error: ' + err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

