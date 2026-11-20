'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button, toast } from '@payloadcms/ui';

interface LocalBackupFile {
  filename: string;
  sizeBytes: number;
  createdAt: string;
}

interface BackupProgressState {
  isRunning: boolean;
  mode: 'db' | 'media' | 'all' | null;
  phase: string;
  message: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  dbFile: string | null;
  dbSizeBytes: number;
  mediaStats: {
    scannedFiles: number;
    totalFiles: number;
    skippedFiles: number;
    uploadedFiles: number;
    failedFiles: number;
    uploadedBytes: number;
    totalBytes: number;
    currentFile: string;
  };
  logs: string[];
}

interface StatusPayload {
  state: BackupProgressState;
  localBackups: LocalBackupFile[];
  dbSizeBytes: number | null;
  mediaStats: { fileCount: number; totalBytes: number } | null;
  driveConnection: {
    ok: boolean;
    email: string | null;
    displayName: string | null;
    quotaLimitBytes: number | null;
    quotaUsageBytes: number | null;
    rootFolderName: string | null;
    error?: string;
  } | null;
  configSummary: {
    authMethod: string;
    hasDriveCredentials: boolean;
    hasOAuthClient: boolean;
    hasRefreshToken: boolean;
    oauthEmail: string | null;
    driveFolderInput: string;
    autoBackupEnabled: boolean;
    backupHour: number;
    backupIncludeMedia: boolean;
    lastBackupAt: string | null;
    lastBackupStatus: string | null;
    lastBackupSummary: string | null;
  };
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || !Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let val = bytes;
  let idx = 0;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return `${val.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
}

function formatDateVi(iso?: string | null): string {
  if (!iso) return 'Chưa có';
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

export const BackupDashboard: React.FC = () => {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [testingDrive, setTestingDrive] = useState(false);
  const [startingMode, setStartingMode] = useState<string | null>(null);

  const fetchStatus = useCallback(async (opts?: { includeStats?: boolean; checkDrive?: boolean }) => {
    const params = new URLSearchParams();
    if (opts?.includeStats) params.set('includeStats', '1');
    if (opts?.checkDrive) params.set('checkDrive', '1');

    const res = await fetch(`/api/backup/status?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json: StatusPayload = await res.json();
    setData((prev) => ({
      ...json,
      dbSizeBytes: json.dbSizeBytes !== null ? json.dbSizeBytes : prev?.dbSizeBytes ?? null,
      mediaStats: json.mediaStats !== null ? json.mediaStats : prev?.mediaStats ?? null,
      driveConnection: json.driveConnection !== null ? json.driveConnection : prev?.driveConnection ?? null,
    }));
    return json;
  }, []);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const gdriveStatus = search.get('gdrive');
    const gdriveError = search.get('gdrive_error');

    if (gdriveStatus === 'connected') {
      toast.success('Đã kết nối tài khoản Google Drive thành công!');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (gdriveError) {
      toast.error(gdriveError);
      window.history.replaceState({}, '', window.location.pathname);
    }

    fetchStatus({ includeStats: true, checkDrive: gdriveStatus === 'connected' })
      .finally(() => setLoadingStats(false));
  }, [fetchStatus]);

  useEffect(() => {
    if (!data?.state?.isRunning) return;
    const timer = setInterval(() => {
      void fetchStatus();
    }, 2000);
    return () => clearInterval(timer);
  }, [data?.state?.isRunning, fetchStatus]);

  const handleTrigger = async (mode: 'db' | 'media' | 'all') => {
    setStartingMode(mode);
    try {
      const res = await fetch('/api/backup/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Không thể khởi chạy sao lưu.');
        return;
      }
      toast.success('Đã bắt đầu tiến trình sao lưu!');
      await fetchStatus();
    } catch {
      toast.error('Lỗi kết nối khi bắt đầu sao lưu.');
    } finally {
      setStartingMode(null);
    }
  };

  const handleTestDrive = async () => {
    setTestingDrive(true);
    try {
      const res = await fetch('/api/backup/status?checkDrive=1', { cache: 'no-store' });
      const json: StatusPayload = await res.json();
      setData((prev) => ({
        ...json,
        dbSizeBytes: prev?.dbSizeBytes ?? json.dbSizeBytes,
        mediaStats: prev?.mediaStats ?? json.mediaStats,
      }));
      if (json.driveConnection?.ok) {
        toast.success(`Kết nối Google Drive OK (${json.driveConnection.email || 'Đã xác thực'})`);
      } else {
        toast.error(json.driveConnection?.error || 'Chưa kết nối Google Drive.');
      }
    } catch {
      toast.error('Không thể kiểm tra kết nối Google Drive.');
    } finally {
      setTestingDrive(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bản sao lưu "${filename}" khỏi VPS?`)) return;
    try {
      const res = await fetch('/api/backup/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Không thể xóa tệp.');
        return;
      }
      toast.success(`Đã xóa ${filename}`);
      await fetchStatus();
    } catch {
      toast.error('Lỗi khi xóa tệp sao lưu.');
    }
  };

  const state = data?.state;
  const cfg = data?.configSummary;
  const isRunning = Boolean(state?.isRunning);
  const driveOk = cfg?.hasDriveCredentials;
  const mediaTotal = state?.mediaStats?.totalFiles || 0;
  const mediaProcessed = (state?.mediaStats?.uploadedFiles || 0) + (state?.mediaStats?.skippedFiles || 0) + (state?.mediaStats?.failedFiles || 0);
  const mediaPercent = mediaTotal > 0 ? Math.min(100, Math.round((mediaProcessed / mediaTotal) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        {/* DB Card */}
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--theme-elevation-150)',
            backgroundColor: 'var(--theme-elevation-50)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)', marginBottom: '6px', fontWeight: 600 }}>
            CƠ SỞ DỮ LIỆU (POSTGRESQL)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--theme-text)' }}>
            {loadingStats ? 'Đang tính...' : formatBytes(data?.dbSizeBytes)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)', marginTop: '6px' }}>
            Đang lưu {data?.localBackups?.length || 0} bản sao lưu trên VPS
          </div>
        </div>

        {/* Media Card */}
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--theme-elevation-150)',
            backgroundColor: 'var(--theme-elevation-50)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)', marginBottom: '6px', fontWeight: 600 }}>
            THƯ VIỆN MEDIA (/app/media)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--theme-text)' }}>
            {loadingStats ? 'Đang quét...' : formatBytes(data?.mediaStats?.totalBytes)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)', marginTop: '6px' }}>
            {loadingStats ? '...' : `${(data?.mediaStats?.fileCount || 0).toLocaleString('vi-VN')} tệp tin (đồng bộ gia tăng)`}
          </div>
        </div>

        {/* Google Drive Card */}
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${driveOk ? 'var(--theme-success-500, #16a34a)' : 'var(--theme-warning-500, #d97706)'}`,
            backgroundColor: 'var(--theme-elevation-50)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)', marginBottom: '6px', fontWeight: 600 }}>
            GOOGLE DRIVE (OFF-SITE)
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: driveOk ? '#16a34a' : '#d97706' }}>
            {driveOk ? 'Đã kết nối' : 'Chưa kết nối'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)', marginTop: '6px', wordBreak: 'break-word' }}>
            {cfg?.oauthEmail
              ? cfg.oauthEmail
              : cfg?.authMethod === 'service_account' && driveOk
                ? 'Service Account JSON'
                : 'Chuyển sang tab "Cấu hình Google Drive" để thiết lập'}
          </div>
          {data?.driveConnection?.ok && data.driveConnection.quotaLimitBytes && (
            <div style={{ fontSize: '11px', color: 'var(--theme-elevation-500)', marginTop: '4px' }}>
              Đã dùng: {formatBytes(data.driveConnection.quotaUsageBytes)} / {formatBytes(data.driveConnection.quotaLimitBytes)}
            </div>
          )}
        </div>

        {/* Last Backup Card */}
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--theme-elevation-150)',
            backgroundColor: 'var(--theme-elevation-50)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)', marginBottom: '6px', fontWeight: 600 }}>
            LẦN SAO LƯU GẦN NHẤT
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--theme-text)' }}>
            {formatDateVi(cfg?.lastBackupAt)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)', marginTop: '6px' }}>
            {cfg?.autoBackupEnabled
              ? `Tự động chạy lúc ${String(cfg.backupHour ?? 2).padStart(2, '0')}:00 mỗi ngày`
              : 'Lịch tự động đang tắt'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-150)',
          backgroundColor: 'var(--theme-elevation-50)',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: '12px', fontSize: '15px' }}>
          Thao tác sao lưu thủ công
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <Button
            onClick={() => handleTrigger('db')}
            disabled={isRunning || Boolean(startingMode)}
            size="medium"
          >
            {startingMode === 'db' ? 'Đang khởi chạy...' : 'Sao lưu CSDL ngay'}
          </Button>

          <Button
            onClick={() => handleTrigger('media')}
            disabled={isRunning || Boolean(startingMode) || !driveOk}
            buttonStyle="secondary"
            size="medium"
          >
            {startingMode === 'media' ? 'Đang khởi chạy...' : 'Đồng bộ Media lên Google Drive'}
          </Button>

          <Button
            onClick={() => handleTrigger('all')}
            disabled={isRunning || Boolean(startingMode)}
            buttonStyle="secondary"
            size="medium"
          >
            {startingMode === 'all' ? 'Đang khởi chạy...' : 'Sao lưu Toàn bộ (CSDL + Media)'}
          </Button>

          <Button
            onClick={handleTestDrive}
            disabled={testingDrive}
            buttonStyle="subtle"
            size="medium"
          >
            {testingDrive ? 'Đang kiểm tra...' : 'Kiểm tra kết nối Drive'}
          </Button>
        </div>

        {!driveOk && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#b45309' }}>
            Mẹo: Bạn vẫn có thể bấm <strong>Sao lưu CSDL ngay</strong> để tạo file nén <code>.sql.gz</code> tải về máy tính ngay lập tức. Để sao lưu cả <strong>Media (6.7 GB)</strong> và tự động đẩy ra ngoài server, vui lòng thiết lập ở tab <strong>Cấu hình Google Drive</strong>.
          </div>
        )}
      </div>

      {/* Live Progress & Logs */}
      {(isRunning || (state?.logs && state.logs.length > 0)) && (
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${state?.phase === 'error' ? '#dc2626' : 'var(--theme-elevation-200)'}`,
            backgroundColor: 'var(--theme-elevation-50)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '10px', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '14px' }}>
              {isRunning ? '⏳ Tiến trình đang chạy: ' : state?.phase === 'error' ? '❌ Tiến trình gặp lỗi: ' : '✅ Trạng thái gần nhất: '}
              {state?.message}
            </strong>
            {mediaTotal > 0 && (
              <span style={{ fontSize: '13px', fontWeight: 600 }}>
                {mediaProcessed}/{mediaTotal} tệp ({mediaPercent}%)
              </span>
            )}
          </div>

          {mediaTotal > 0 && (
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--theme-elevation-150)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
              <div
                style={{
                  width: `${mediaPercent}%`,
                  height: '100%',
                  backgroundColor: state?.phase === 'error' ? '#dc2626' : '#16a34a',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          )}

          {state?.logs && state.logs.length > 0 && (
            <pre
              style={{
                margin: 0,
                padding: '10px 12px',
                backgroundColor: '#111827',
                color: '#e5e7eb',
                borderRadius: '6px',
                fontSize: '12px',
                lineHeight: 1.5,
                maxHeight: '200px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {state.logs.join('\n')}
            </pre>
          )}
        </div>
      )}

      {/* Local Backups Table */}
      <div
        style={{
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-150)',
          backgroundColor: 'var(--theme-elevation-50)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <strong style={{ fontSize: '15px' }}>Danh sách bản sao lưu CSDL lưu trên VPS</strong>
          <Button onClick={() => void fetchStatus({ includeStats: true })} buttonStyle="subtle" size="small">
            Làm mới
          </Button>
        </div>

        {!data?.localBackups || data.localBackups.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--theme-elevation-500)', padding: '12px 0' }}>
            Chưa có bản sao lưu nào được tạo từ giao diện Admin. Bấm <strong>Sao lưu CSDL ngay</strong> ở trên để tạo bản đầu tiên.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--theme-elevation-150)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Tên tệp</th>
                  <th style={{ padding: '8px 10px' }}>Thời gian tạo</th>
                  <th style={{ padding: '8px 10px' }}>Dung lượng</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.localBackups.map((item) => (
                  <tr key={item.filename} style={{ borderBottom: '1px solid var(--theme-elevation-100)' }}>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{item.filename}</td>
                    <td style={{ padding: '8px 10px' }}>{formatDateVi(item.createdAt)}</td>
                    <td style={{ padding: '8px 10px' }}>{formatBytes(item.sizeBytes)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <a
                        href={`/api/backup/download?file=${encodeURIComponent(item.filename)}`}
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--theme-elevation-150)',
                          color: 'var(--theme-text)',
                          textDecoration: 'none',
                          fontWeight: 600,
                          marginRight: '8px',
                        }}
                      >
                        Tải về
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteBackup(item.filename)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: '1px solid #ef4444',
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
          Khôi phục nhanh trên PostgreSQL bằng lệnh: <code>gunzip -c backup_db_...sql.gz | docker exec -i &lt;postgres_container&gt; psql -U postgres -d postgres</code>
        </div>
      </div>
    </div>
  );
};
