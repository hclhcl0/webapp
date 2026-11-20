import cron from 'node-cron';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { hasDriveCredentials, runBackupTask } from '../lib/googleDriveBackup';
import { getBackupState } from '../lib/backupEngine';

const globalForCron = globalThis as unknown as {
  __cdcAutoBackupCronStarted?: boolean;
  __cdcLastAutoBackupDay?: string;
};

function getVietnamDateAndHour(): { dayKey: string; hour: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return {
    dayKey: `${map.year}-${map.month}-${map.day}`,
    hour: Number(map.hour) % 24,
  };
}

export function initAutoBackupCron(): void {
  if (globalForCron.__cdcAutoBackupCronStarted) return;
  globalForCron.__cdcAutoBackupCronStarted = true;

  // Check every hour at minute 0 in Vietnam timezone so Admin UI hour changes apply dynamically
  cron.schedule(
    '0 * * * *',
    async () => {
      try {
        const payload = await getPayload({ config: configPromise });
        const settings: any = await payload.findGlobal({
          slug: 'backup-settings' as any,
          overrideAccess: true,
        });

        if (!settings?.autoBackupEnabled) return;

        const targetHour = Number.isFinite(Number(settings.backupHour))
          ? Math.max(0, Math.min(23, Math.floor(Number(settings.backupHour))))
          : 2;

        const { dayKey, hour } = getVietnamDateAndHour();
        if (hour !== targetHour) return;
        if (globalForCron.__cdcLastAutoBackupDay === dayKey) return;
        if (getBackupState().isRunning) return;

        globalForCron.__cdcLastAutoBackupDay = dayKey;
        const canSyncMedia = Boolean(settings.backupIncludeMedia) && hasDriveCredentials(settings);
        const mode = canSyncMedia ? 'all' : 'db';

        console.log(`[CRON Backup] Bắt đầu sao lưu tự động (${dayKey} ${hour}:00 ICT), mode=${mode}`);
        await runBackupTask(payload, mode, 'cron');
      } catch (err) {
        console.error('[CRON Backup] Lỗi sao lưu tự động:', err);
      }
    },
    { timezone: 'Asia/Ho_Chi_Minh' },
  );
}
