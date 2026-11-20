import fs from 'fs';
import path from 'path';
import { google, type drive_v3 } from 'googleapis';
import type { Payload } from 'payload';
import {
  MEDIA_DIR,
  appendBackupLog,
  cleanupOldLocalDbBackups,
  createDatabaseBackupFile,
  getBackupState,
} from './backupEngine';

export interface DriveConnectionInfo {
  ok: boolean;
  email: string | null;
  displayName: string | null;
  quotaLimitBytes: number | null;
  quotaUsageBytes: number | null;
  rootFolderId: string | null;
  rootFolderName: string | null;
  error?: string;
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let val = bytes;
  let idx = 0;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return `${val.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
}

export function extractDriveFolderId(input?: string | null): string | null {
  const raw = (input || '').trim();
  if (!raw) return null;

  const folderMatch = raw.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch?.[1]) return folderMatch[1];

  const idMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch?.[1]) return idMatch[1];

  if (/^[a-zA-Z0-9_-]{10,}$/.test(raw)) return raw;
  return null;
}

export function hasDriveCredentials(settings: any): boolean {
  if (!settings) return false;
  if (settings.authMethod === 'service_account') {
    return Boolean((settings.serviceAccountJson || '').trim());
  }
  return Boolean(
    (settings.oauthClientId || '').trim() &&
      (settings.oauthClientSecret || '').trim() &&
      (settings.oauthRefreshToken || '').trim(),
  );
}

function guessMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.zip': 'application/zip',
    '.gz': 'application/gzip',
  };
  return map[ext] || 'application/octet-stream';
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  let lastErr: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const status = err?.code || err?.status || err?.response?.status;
      const retryable =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        err?.code === 'ECONNRESET' ||
        err?.code === 'ETIMEDOUT';

      if (!retryable || attempt === maxAttempts) {
        throw err;
      }
      const delayMs = Math.min(15000, 1000 * Math.pow(2, attempt - 1));
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

export function createDriveClient(settings: any, redirectUri?: string): drive_v3.Drive {
  if (settings?.authMethod === 'service_account') {
    const rawJson = (settings.serviceAccountJson || '').trim();
    if (!rawJson) {
      throw new Error('Chưa nhập nội dung JSON của Google Service Account.');
    }
    let credentials: any;
    try {
      credentials = JSON.parse(rawJson);
    } catch {
      throw new Error('Nội dung Service Account JSON không hợp lệ.');
    }
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return google.drive({ version: 'v3', auth });
  }

  const clientId = (settings?.oauthClientId || '').trim();
  const clientSecret = (settings?.oauthClientSecret || '').trim();
  const refreshToken = (settings?.oauthRefreshToken || '').trim();

  if (!clientId || !clientSecret) {
    throw new Error('Thiếu Google OAuth Client ID hoặc Client Secret.');
  }
  if (!refreshToken) {
    throw new Error('Chưa đăng nhập / kết nối tài khoản Google Drive.');
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2.setCredentials({
    refresh_token: refreshToken,
    access_token: settings.oauthAccessToken || undefined,
    expiry_date: settings.oauthTokenExpiry ? Number(settings.oauthTokenExpiry) : undefined,
  });

  return google.drive({ version: 'v3', auth: oauth2 });
}

export async function verifyGoogleDriveConnection(settings: any): Promise<DriveConnectionInfo> {
  try {
    if (!hasDriveCredentials(settings)) {
      return {
        ok: false,
        email: settings?.oauthEmail || null,
        displayName: null,
        quotaLimitBytes: null,
        quotaUsageBytes: null,
        rootFolderId: null,
        rootFolderName: null,
        error: 'Chưa kết nối tài khoản Google Drive.',
      };
    }

    const drive = createDriveClient(settings);
    const aboutRes = await withRetry(() =>
      drive.about.get({
        fields: 'user(emailAddress,displayName),storageQuota(limit,usage)',
      }),
    );

    const customFolderId = extractDriveFolderId(settings.driveFolderInput);
    let rootFolderId: string | null = customFolderId;
    let rootFolderName: string | null = customFolderId ? null : 'CDC_BACKUP (tự tạo ở gốc Drive)';

    if (customFolderId) {
      const fRes = await withRetry(() =>
        drive.files.get({
          fileId: customFolderId,
          fields: 'id, name, mimeType, trashed',
          supportsAllDrives: true,
        }),
      );
      if (fRes.data.trashed) {
        return {
          ok: false,
          email: aboutRes.data.user?.emailAddress || null,
          displayName: aboutRes.data.user?.displayName || null,
          quotaLimitBytes: null,
          quotaUsageBytes: null,
          rootFolderId: customFolderId,
          rootFolderName: fRes.data.name || null,
          error: 'Thư mục Google Drive đã chọn đang nằm trong Thùng rác.',
        };
      }
      if (fRes.data.mimeType !== FOLDER_MIME) {
        return {
          ok: false,
          email: aboutRes.data.user?.emailAddress || null,
          displayName: aboutRes.data.user?.displayName || null,
          quotaLimitBytes: null,
          quotaUsageBytes: null,
          rootFolderId: customFolderId,
          rootFolderName: fRes.data.name || null,
          error: 'ID đã nhập không phải là thư mục Google Drive.',
        };
      }
      rootFolderName = fRes.data.name || customFolderId;
    }

    return {
      ok: true,
      email: aboutRes.data.user?.emailAddress || settings?.oauthEmail || null,
      displayName: aboutRes.data.user?.displayName || null,
      quotaLimitBytes: aboutRes.data.storageQuota?.limit ? Number(aboutRes.data.storageQuota.limit) : null,
      quotaUsageBytes: aboutRes.data.storageQuota?.usage ? Number(aboutRes.data.storageQuota.usage) : null,
      rootFolderId,
      rootFolderName,
    };
  } catch (err: any) {
    return {
      ok: false,
      email: settings?.oauthEmail || null,
      displayName: null,
      quotaLimitBytes: null,
      quotaUsageBytes: null,
      rootFolderId: null,
      rootFolderName: null,
      error: err?.message || 'Không thể kết nối Google Drive.',
    };
  }
}

async function findOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId?: string,
): Promise<string> {
  const escapedName = name.replace(/'/g, "\\'");
  const parentClause = parentId ? `'${parentId}' in parents` : `'root' in parents`;
  const q = `${parentClause} and name = '${escapedName}' and mimeType = '${FOLDER_MIME}' and trashed = false`;

  const listRes = await withRetry(() =>
    drive.files.list({
      q,
      fields: 'files(id, name)',
      pageSize: 5,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    }),
  );

  const existing = listRes.data.files?.[0];
  if (existing?.id) return existing.id;

  const createRes = await withRetry(() =>
    drive.files.create({
      requestBody: {
        name,
        mimeType: FOLDER_MIME,
        ...(parentId ? { parents: [parentId] } : {}),
      },
      fields: 'id',
      supportsAllDrives: true,
    }),
  );

  if (!createRes.data.id) {
    throw new Error(`Không thể tạo thư mục "${name}" trên Google Drive.`);
  }
  return createRes.data.id;
}

async function ensureDriveFolders(
  drive: drive_v3.Drive,
  settings: any,
): Promise<{ rootId: string; dbId: string; mediaId: string }> {
  const customRoot = extractDriveFolderId(settings.driveFolderInput);
  const rootId = customRoot || (await findOrCreateFolder(drive, 'CDC_BACKUP'));
  const dbId = await findOrCreateFolder(drive, 'db', rootId);
  const mediaId = await findOrCreateFolder(drive, 'media', rootId);
  return { rootId, dbId, mediaId };
}

interface DriveChildItem {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  createdTime?: string;
}

async function listDriveFolderChildren(
  drive: drive_v3.Drive,
  folderId: string,
): Promise<Map<string, DriveChildItem>> {
  const map = new Map<string, DriveChildItem>();
  let pageToken: string | undefined;

  do {
    const res = await withRetry(() =>
      drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime)',
        pageSize: 1000,
        pageToken,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      }),
    );

    for (const f of res.data.files || []) {
      if (f.id && f.name) {
        map.set(f.name, {
          id: f.id,
          name: f.name,
          mimeType: f.mimeType || '',
          sizeBytes: f.size ? Number(f.size) : 0,
          createdTime: f.createdTime || undefined,
        });
      }
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  return map;
}

async function uploadLocalFileToDrive(
  drive: drive_v3.Drive,
  localPath: string,
  filename: string,
  parentFolderId: string,
  existingFileId?: string,
): Promise<string> {
  const mimeType = guessMimeType(filename);

  const res = await withRetry(() => {
    const body = fs.createReadStream(localPath);
    if (existingFileId) {
      return drive.files.update({
        fileId: existingFileId,
        media: { mimeType, body },
        fields: 'id',
        supportsAllDrives: true,
      });
    }
    return drive.files.create({
      requestBody: {
        name: filename,
        parents: [parentFolderId],
      },
      media: { mimeType, body },
      fields: 'id',
      supportsAllDrives: true,
    });
  });

  if (!res.data.id) {
    throw new Error(`Upload thất bại cho file ${filename}`);
  }
  return res.data.id;
}

async function pruneOldDriveDbBackups(
  drive: drive_v3.Drive,
  dbFolderId: string,
  retainCount: number,
): Promise<number> {
  const limit = Math.max(1, Math.floor(retainCount || 30));
  const res = await withRetry(() =>
    drive.files.list({
      q: `'${dbFolderId}' in parents and trashed = false and name contains 'backup_db_'`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 500,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    }),
  );

  const files = res.data.files || [];
  let deleted = 0;
  if (files.length > limit) {
    for (const oldFile of files.slice(limit)) {
      if (!oldFile.id) continue;
      await withRetry(() =>
        drive.files.delete({
          fileId: oldFile.id!,
          supportsAllDrives: true,
        }),
      );
      deleted++;
    }
  }
  return deleted;
}

interface LocalMediaEntry {
  fullPath: string;
  relDirParts: string[];
  filename: string;
  sizeBytes: number;
}

async function collectLocalMediaFiles(): Promise<{ files: LocalMediaEntry[]; totalBytes: number }> {
  const files: LocalMediaEntry[] = [];
  let totalBytes = 0;

  if (!fs.existsSync(MEDIA_DIR)) {
    return { files, totalBytes };
  }

  async function walk(dir: string, relParts: string[]) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.system-backups' || entry.name === '.DS_Store') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, [...relParts, entry.name]);
      } else if (entry.isFile()) {
        try {
          const stat = await fs.promises.stat(fullPath);
          files.push({
            fullPath,
            relDirParts: relParts,
            filename: entry.name,
            sizeBytes: stat.size,
          });
          totalBytes += stat.size;
        } catch {
          // Ignore file disappeared mid-scan
        }
      }
    }
  }

  await walk(MEDIA_DIR, []);
  return { files, totalBytes };
}

async function syncMediaToDrive(drive: drive_v3.Drive, mediaRootFolderId: string): Promise<void> {
  const state = getBackupState();
  state.phase = 'scanning_media';
  state.message = 'Đang quét danh sách tệp Media...';
  appendBackupLog('Bắt đầu quét thư mục Media...');

  const { files, totalBytes } = await collectLocalMediaFiles();
  state.mediaStats.totalFiles = files.length;
  state.mediaStats.totalBytes = totalBytes;
  appendBackupLog(`Tìm thấy ${files.length} tệp Media (${formatBytes(totalBytes)}). Đang kiểm tra trên Google Drive...`);

  state.phase = 'syncing_media';
  state.message = 'Đang đồng bộ Media lên Google Drive...';

  // Cache folder IDs and remote file listings by relative directory key
  const folderIdCache = new Map<string, string>([['', mediaRootFolderId]]);
  const childrenCache = new Map<string, Map<string, DriveChildItem>>();

  async function getFolderChildrenForDir(relDirParts: string[]): Promise<{
    folderId: string;
    children: Map<string, DriveChildItem>;
  }> {
    let currKey = '';
    let parentId = mediaRootFolderId;

    for (const part of relDirParts) {
      const nextKey = currKey ? `${currKey}/${part}` : part;
      let folderId = folderIdCache.get(nextKey);
      if (!folderId) {
        let parentChildren = childrenCache.get(currKey);
        if (!parentChildren) {
          parentChildren = await listDriveFolderChildren(drive, parentId);
          childrenCache.set(currKey, parentChildren);
        }
        const existingSub = parentChildren.get(part);
        if (existingSub && existingSub.mimeType === FOLDER_MIME) {
          folderId = existingSub.id;
        } else {
          folderId = await findOrCreateFolder(drive, part, parentId);
          parentChildren.set(part, {
            id: folderId,
            name: part,
            mimeType: FOLDER_MIME,
            sizeBytes: 0,
          });
        }
        folderIdCache.set(nextKey, folderId);
      }
      parentId = folderId;
      currKey = nextKey;
    }

    let children = childrenCache.get(currKey);
    if (!children) {
      children = await listDriveFolderChildren(drive, parentId);
      childrenCache.set(currKey, children);
    }
    return { folderId: parentId, children };
  }

  // Group files by directory so parent Drive folder listing only happens once per directory
  const filesByDir = new Map<string, LocalMediaEntry[]>();
  for (const item of files) {
    const dirKey = item.relDirParts.join('/');
    const list = filesByDir.get(dirKey);
    if (list) list.push(item);
    else filesByDir.set(dirKey, [item]);
  }

  for (const [, dirFiles] of filesByDir) {
    const { folderId, children } = await getFolderChildrenForDir(dirFiles[0].relDirParts);

    // Filter out already synced files immediately
    const pendingUpload: Array<{ item: LocalMediaEntry; existingId?: string }> = [];
    for (const item of dirFiles) {
      state.mediaStats.scannedFiles++;
      const existing = children.get(item.filename);
      if (existing && existing.mimeType !== FOLDER_MIME && existing.sizeBytes === item.sizeBytes) {
        state.mediaStats.skippedFiles++;
        state.mediaStats.uploadedBytes += item.sizeBytes;
      } else {
        pendingUpload.push({ item, existingId: existing?.id });
      }
    }

    // Upload new/changed files in small parallel batches
    const CONCURRENCY = 3;
    for (let i = 0; i < pendingUpload.length; i += CONCURRENCY) {
      const chunk = pendingUpload.slice(i, i + CONCURRENCY);
      await Promise.all(
        chunk.map(async ({ item, existingId }) => {
          state.mediaStats.currentFile = item.filename;
          state.message = `Đang tải lên Media (${state.mediaStats.uploadedFiles + state.mediaStats.skippedFiles}/${state.mediaStats.totalFiles}): ${item.filename}`;
          try {
            await uploadLocalFileToDrive(drive, item.fullPath, item.filename, folderId, existingId);
            state.mediaStats.uploadedFiles++;
            state.mediaStats.uploadedBytes += item.sizeBytes;
          } catch (err: any) {
            state.mediaStats.failedFiles++;
            appendBackupLog(`⚠️ Lỗi tải file ${item.filename}: ${err?.message || 'Lỗi không xác định'}`);
          }
        }),
      );
    }
  }
}

export async function runBackupTask(payload: Payload, mode: 'db' | 'media' | 'all', triggerSource: 'manual' | 'cron'): Promise<void> {
  const state = getBackupState();
  if (state.isRunning) {
    throw new Error('Một tiến trình sao lưu khác đang chạy, vui lòng đợi hoàn tất.');
  }

  state.isRunning = true;
  state.mode = mode;
  state.phase = mode === 'media' ? 'scanning_media' : 'dumping_db';
  state.startedAt = new Date().toISOString();
  state.finishedAt = null;
  state.error = null;
  state.dbFile = null;
  state.dbSizeBytes = 0;
  state.mediaStats = {
    scannedFiles: 0,
    totalFiles: 0,
    skippedFiles: 0,
    uploadedFiles: 0,
    failedFiles: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    currentFile: '',
  };
  state.logs = [];

  const sourceLabel = triggerSource === 'cron' ? 'Tự động (Cron)' : 'Thủ công (Admin)';
  appendBackupLog(`Bắt đầu sao lưu [${mode.toUpperCase()}] — Nguồn: ${sourceLabel}`);

  const summaryParts: string[] = [];

  try {
    const settings = await payload.findGlobal({
      slug: 'backup-settings' as any,
      overrideAccess: true,
    });

    const driveConfigured = hasDriveCredentials(settings);
    let drive: drive_v3.Drive | null = null;
    let folders: { rootId: string; dbId: string; mediaId: string } | null = null;

    const getDriveAndFolders = async () => {
      if (drive && folders) return { drive, folders };
      drive = createDriveClient(settings);
      folders = await ensureDriveFolders(drive, settings);
      return { drive, folders };
    };

    if (mode === 'db' || mode === 'all') {
      state.phase = 'dumping_db';
      state.message = 'Đang kết xuất cơ sở dữ liệu PostgreSQL...';
      appendBackupLog('Đang xuất snapshot PostgreSQL (.sql.gz)...');

      const dumpResult = await createDatabaseBackupFile();
      state.dbFile = dumpResult.filename;
      state.dbSizeBytes = dumpResult.sizeBytes;
      appendBackupLog(
        `✅ Xuất CSDL thành công: ${dumpResult.filename} (${formatBytes(dumpResult.sizeBytes)}, ${dumpResult.tableCount} bảng, ${dumpResult.rowCount.toLocaleString('vi-VN')} dòng).`,
      );
      summaryParts.push(`CSDL: ${dumpResult.filename} (${formatBytes(dumpResult.sizeBytes)})`);

      const prunedLocal = cleanupOldLocalDbBackups(Number(settings?.retainLocalDays) || 7);
      if (prunedLocal > 0) {
        appendBackupLog(`Đã dọn dẹp ${prunedLocal} bản CSDL cục bộ cũ hơn ${Number(settings?.retainLocalDays) || 7} ngày.`);
      }

      if (driveConfigured) {
        state.phase = 'uploading_db';
        state.message = 'Đang tải bản sao lưu CSDL lên Google Drive...';
        appendBackupLog('Đang tải file CSDL lên Google Drive (thư mục db/)...');

        const { drive: dClient, folders: dFolders } = await getDriveAndFolders();
        await uploadLocalFileToDrive(dClient, dumpResult.filePath, dumpResult.filename, dFolders.dbId);
        appendBackupLog('✅ Đã tải CSDL lên Google Drive thành công.');

        const prunedDrive = await pruneOldDriveDbBackups(
          dClient,
          dFolders.dbId,
          Number(settings?.retainDriveCount) || 30,
        );
        if (prunedDrive > 0) {
          appendBackupLog(`Đã xóa ${prunedDrive} bản CSDL cũ quá hạn trên Google Drive.`);
        }
        summaryParts.push('Google Drive DB: Đã đồng bộ');
      } else {
        appendBackupLog('ℹ️ Chưa kết nối Google Drive — chỉ lưu bản sao lưu CSDL trên VPS.');
      }
    }

    if (mode === 'media' || mode === 'all') {
      if (!driveConfigured) {
        if (mode === 'media') {
          throw new Error('Cần kết nối Google Drive trước khi đồng bộ Media.');
        }
        appendBackupLog('⚠️ Bỏ qua đồng bộ Media vì chưa kết nối Google Drive.');
      } else {
        const { drive: dClient, folders: dFolders } = await getDriveAndFolders();
        await syncMediaToDrive(dClient, dFolders.mediaId);
        const ms = state.mediaStats;
        appendBackupLog(
          `✅ Đồng bộ Media hoàn tất: Tải mới ${ms.uploadedFiles} file, giữ nguyên ${ms.skippedFiles} file đã có, lỗi ${ms.failedFiles} file.`,
        );
        summaryParts.push(
          `Media: +${ms.uploadedFiles} mới / ${ms.skippedFiles} không đổi / ${ms.failedFiles} lỗi`,
        );
      }
    }

    state.phase = 'done';
    state.finishedAt = new Date().toISOString();
    state.message = 'Hoàn tất sao lưu!';

    await payload.updateGlobal({
      slug: 'backup-settings' as any,
      overrideAccess: true,
      data: {
        lastBackupAt: state.finishedAt,
        lastBackupStatus: state.mediaStats.failedFiles > 0 ? 'warning' : 'success',
        lastBackupSummary: summaryParts.join(' | '),
      },
    });
  } catch (err: any) {
    const errMsg = err?.message || 'Lỗi không xác định khi sao lưu.';
    state.phase = 'error';
    state.error = errMsg;
    state.finishedAt = new Date().toISOString();
    state.message = `Lỗi: ${errMsg}`;
    appendBackupLog(`❌ LỖI: ${errMsg}`);

    await payload
      .updateGlobal({
        slug: 'backup-settings' as any,
        overrideAccess: true,
        data: {
          lastBackupAt: state.finishedAt,
          lastBackupStatus: 'error',
          lastBackupSummary: `Lỗi (${sourceLabel}): ${errMsg}`,
        },
      })
      .catch(() => {});
  } finally {
    state.isRunning = false;
  }
}
