import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/backupAuth';
import { getBackupState } from '@/lib/backupEngine';
import { hasDriveCredentials, runBackupTask } from '@/lib/googleDriveBackup';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { payload, errorResponse } = await requireAdminUser(request);
  if (errorResponse) return errorResponse;

  const state = getBackupState();
  if (state.isRunning) {
    return NextResponse.json(
      { error: 'Một tiến trình sao lưu khác đang chạy, vui lòng đợi hoàn tất.' },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const mode = body?.mode;
  if (mode !== 'db' && mode !== 'media' && mode !== 'all') {
    return NextResponse.json(
      { error: 'Chế độ sao lưu không hợp lệ (chấp nhận db, media, all).' },
      { status: 400 },
    );
  }

  if (mode === 'media') {
    const settings = await payload.findGlobal({
      slug: 'backup-settings' as any,
      overrideAccess: true,
    });
    if (!hasDriveCredentials(settings)) {
      return NextResponse.json(
        { error: 'Vui lòng kết nối Google Drive trước khi đồng bộ Media.' },
        { status: 400 },
      );
    }
  }

  // Launch asynchronously in background so reverse-proxy / browser requests never time out
  void runBackupTask(payload, mode, 'manual');

  return NextResponse.json({
    started: true,
    state: getBackupState(),
  });
}
