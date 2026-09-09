export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const fullSlug = (slug || []).join('/');
  const { searchParams } = new URL(request.url);
  const queryId = searchParams.get('id');

  // 1. Trích xuất ID tài liệu (số ở cuối slug, ví dụ: ...-568 -> 568, hoặc /laws/detail/568 -> 568)
  let docId: string | null = queryId && queryId !== '0' ? queryId : null;
  if (!docId) {
    const match = fullSlug.match(/(?:^|-)(\d+)(?:\/|$)/);
    if (match) {
      docId = match[1];
    }
  }

  try {
    const payload = await getPayload({ config: configPromise });

    if (docId) {
      // 2. Tìm kiếm trong bảng media: file bắt đầu hoặc chứa docId (ví dụ 568_0001.pdf, 565.tb...)
      const mediaResult = await payload.find({
        collection: 'media',
        where: {
          or: [
            { filename: { like: `${docId}_%` } },
            { filename: { like: `${docId}.%` } },
            { filename: { like: `${docId}-%` } },
            { filename: { equals: `${docId}.pdf` } },
            { filename: { like: `%_${docId}.pdf` } },
          ],
        },
        limit: 1,
      });

      if (mediaResult.docs.length > 0 && (mediaResult.docs[0] as any)?.url) {
        return NextResponse.redirect(new URL((mediaResult.docs[0] as any).url, request.url), 302);
      }

      // 3. Tìm kiếm trong bảng procurements (Thông tin mua sắm)
      const procResult = await payload.find({
        collection: 'procurements' as any,
        where: {
          or: [
            { documentNumber: { contains: docId } },
            { driveUrl: { contains: `-${docId}` } },
          ],
        },
        limit: 1,
        depth: 1,
      });

      if (procResult.docs.length > 0) {
        const proc = procResult.docs[0] as any;
        if (proc.file?.url) {
          return NextResponse.redirect(new URL(proc.file.url, request.url), 302);
        }
      }

      // 4. Tìm kiếm trong bảng documents (Văn bản)
      const docResult = await payload.find({
        collection: 'documents' as any,
        where: {
          or: [
            { documentNumber: { contains: docId } },
            { driveUrl: { contains: `-${docId}` } },
          ],
        },
        limit: 1,
        depth: 1,
      });

      if (docResult.docs.length > 0) {
        const docItem = docResult.docs[0] as any;
        if (docItem.file?.url) {
          return NextResponse.redirect(new URL(docItem.file.url, request.url), 302);
        }
      }
    }
  } catch (err) {
    console.error('[laws/detail] Error resolving legacy PDF link:', err);
  }

  // 5. Nếu không tìm thấy tệp, chuyển hướng về danh sách mua sắm
  return NextResponse.redirect(new URL('/mua-sam', request.url), 302);
}
