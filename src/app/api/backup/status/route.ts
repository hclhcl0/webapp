import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/backupAuth';
import {
  getBackupState,
  getDatabaseSizeBytes,
  getLocalDbBackups,
  getMediaDirectoryStats,
} from '@/lib/backupEngine';
import { hasDriveCredentials, verifyGoogleDriveConnection } from '@/lib/googleDriveBackup';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { payload, errorResponse } = await requireAdminUser(request);
  if (errorResponse) return errorResponse;

  const url = new URL(request.url);
  const includeStats = url.searchParams.get('includeStats') === '1';
  const checkDrive = url.searchParams.get('checkDrive') === '1';

  const settings: any = await payload.findGlobal({
    slug: 'backup-settings' as any,
    overrideAccess: true,
  });

  const localBackups = getLocalDbBackups();
  const state = getBackupState();

  let dbSizeBytes: number | null = null;
  let mediaStats: { fileCount: number; totalBytes: number } | null = null;

  if (includeStats) {
    [dbSizeBytes, mediaStats] = await Promise.all([
      getDatabaseSizeBytes().catch(() => 0),
      getMediaDirectoryStats().catch(() => ({ fileCount: 0, totalBytes: 0 })),
    ]);
  }

  let driveConnection = null;
  if (checkDrive) {
    driveConnection = await verifyGoogleDriveConnection(settings);
  }

  return NextResponse.json({
    state,
    localBackups,
    dbSizeBytes,
    mediaStats,
    driveConnection,
    configSummary: {
      authMethod: settings?.authMethod || 'oauth2',
      hasDriveCredentials: hasDriveCredentials(settings),
      hasOAuthClient: Boolean((settings?.oauthClientId || '').trim() && (settings?.oauthClientSecret || '').trim()),
      hasRefreshToken: Boolean((settings?.oauthRefreshToken || '').trim()),
      oauthEmail: settings?.oauthEmail || null,
      driveFolderInput: settings?.driveFolderInput || '',
      autoBackupEnabled: settings?.autoBackupEnabled ?? true,
      backupHour: settings?.backupHour ?? 2,
      backupIncludeMedia: settings?.backupIncludeMedia ?? true,
      lastBackupAt: settings?.lastBackupAt || null,
      lastBackupStatus: settings?.lastBackupStatus || null,
      lastBackupSummary: settings?.lastBackupSummary || null,
    },
  });
}
