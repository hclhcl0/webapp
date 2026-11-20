'use client';

import React, { useEffect, useState } from 'react';
import { toast } from '@payloadcms/ui';

export const OAuthGuideField: React.FC = () => {
  const [redirectUri, setRedirectUri] = useState('https://ksbtdanang.vn/api/backup/oauth/callback');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectUri(`${window.location.origin}/api/backup/oauth/callback`);
    }
  }, []);

  const copyUri = async () => {
    try {
      await navigator.clipboard.writeText(redirectUri);
      toast.success('Đã sao chép Authorized Redirect URI!');
    } catch {
      toast.error('Không thể tự động sao chép, vui lòng bôi đen copy thủ công.');
    }
  };

  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: '8px',
        border: '1px solid var(--theme-elevation-150)',
        backgroundColor: 'var(--theme-elevation-50)',
        marginBottom: '16px',
        fontSize: '13px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <strong>Đường dẫn gọi lại OAuth (Authorized Redirect URI):</strong>
          <div style={{ marginTop: '4px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{redirectUri}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={copyUri}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid var(--theme-elevation-200)',
              backgroundColor: 'var(--theme-elevation-100)',
              color: 'var(--theme-text)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            Sao chép URI
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid var(--theme-elevation-200)',
              backgroundColor: 'transparent',
              color: 'var(--theme-text)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {expanded ? 'Ẩn hướng dẫn' : 'Xem hướng dẫn tạo Client ID (4 bước)'}
          </button>
        </div>
      </div>

      {expanded && (
        <ol style={{ marginTop: '12px', marginBottom: 0, paddingLeft: '20px', lineHeight: 1.7 }}>
          <li>
            Truy cập <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank" rel="noreferrer">Google Cloud Console</a>, tạo project mới (hoặc chọn project sẵn có) và bấm <strong>Enable</strong> mục <strong>Google Drive API</strong>.
          </li>
          <li>
            Vào <strong>APIs &amp; Services → OAuth consent screen</strong>: chọn <strong>External</strong> (hoặc Internal nếu dùng Workspace), điền tên ứng dụng (VD: <code>CDC Backup</code>), thêm email Google sẽ dùng vào mục <strong>Test users</strong> (nếu app ở trạng thái Testing).
          </li>
          <li>
            Vào <strong>APIs &amp; Services → Credentials → Create Credentials → OAuth client ID</strong>, chọn <strong>Web application</strong> và dán đường dẫn ở trên vào mục <strong>Authorized redirect URIs</strong>.
          </li>
          <li>
            Copy <strong>Client ID</strong> và <strong>Client Secret</strong> dán vào 2 ô bên dưới, rồi bấm nút <strong>Lưu &amp; Đăng nhập Google Drive</strong>.
          </li>
        </ol>
      )}
    </div>
  );
};
