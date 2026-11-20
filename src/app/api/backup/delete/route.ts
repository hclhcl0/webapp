import fs from 'fs';
import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/backupAuth';
import { resolveSafeBackupPath } from '@/lib/backupEngine';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { errorResponse } = await requireAdminUser(request);
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => ({}));
  const filename = typeof body?.filename === 'string' ? body.filename : '';
  const safePath = resolveSafeBackupPath(filename);

  if (!safePath || !fs.existsSync(safePath)) {
    return NextResponse.json(
      { error: 'Không tìm thấy tệp sao lưu cần xóa.' },
      { status: 404 },
    );
  }

  fs.unlinkSync(safePath);
  return NextResponse.json({ deleted: true, filename });
}
