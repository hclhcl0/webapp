import fs from 'fs';
import { Readable } from 'stream';
import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/backupAuth';
import { resolveSafeBackupPath } from '@/lib/backupEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { errorResponse } = await requireAdminUser(request);
  if (errorResponse) return errorResponse;

  const url = new URL(request.url);
  const filename = url.searchParams.get('file') || '';
  const safePath = resolveSafeBackupPath(filename);

  if (!safePath || !fs.existsSync(safePath)) {
    return NextResponse.json(
      { error: 'Không tìm thấy tệp sao lưu hợp lệ.' },
      { status: 404 },
    );
  }

  const stat = fs.statSync(safePath);
  const nodeStream = fs.createReadStream(safePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(stat.size),
      'Cache-Control': 'no-store',
    },
  });
}
