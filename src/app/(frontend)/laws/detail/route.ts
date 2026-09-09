export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryId = searchParams.get('id');

  if (queryId && queryId !== '0') {
    try {
      const payload = await getPayload({ config: configPromise });
      const mediaResult = await payload.find({
        collection: 'media',
        where: {
          or: [
            { filename: { like: `${queryId}_%` } },
            { filename: { like: `${queryId}.%` } },
            { filename: { like: `${queryId}-%` } },
            { filename: { equals: `${queryId}.pdf` } },
            { filename: { like: `%_${queryId}.pdf` } },
          ],
        },
        limit: 1,
      });

      if (mediaResult.docs.length > 0 && (mediaResult.docs[0] as any)?.url) {
        return NextResponse.redirect(new URL((mediaResult.docs[0] as any).url, request.url), 302);
      }
    } catch (err) {
      console.error('[laws/detail root] Error resolving query ID:', err);
    }
  }

  return NextResponse.redirect(new URL('/mua-sam', request.url), 302);
}
