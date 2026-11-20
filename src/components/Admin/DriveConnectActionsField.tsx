'use client';

import React, { useEffect, useState } from 'react';
import { Button, toast, useForm, useFormFields } from '@payloadcms/ui';

export const DriveConnectActionsField: React.FC = () => {
  const [busy, setBusy] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [hasRefreshToken, setHasRefreshToken] = useState(false);

  const authMethod = useFormFields(([fields]) => (fields.authMethod?.value as string) || 'oauth2');
  const oauthClientId = useFormFields(([fields]) => (fields.oauthClientId?.value as string) || '');
  const oauthClientSecret = useFormFields(([fields]) => (fields.oauthClientSecret?.value as string) || '');
  const oauthEmail = useFormFields(([fields]) => (fields.oauthEmail?.value as string) || '');
  const serviceAccountJson = useFormFields(([fields]) => (fields.serviceAccountJson?.value as string) || '');
  const driveFolderInput = useFormFields(([fields]) => (fields.driveFolderInput?.value as string) || '');

  const { dispatchFields } = useForm();

  useEffect(() => {
    fetch('/api/backup/status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.configSummary?.hasRefreshToken) {
          setHasRefreshToken(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveAndConnectOAuth = async () => {
    if (!oauthClientId.trim() || !oauthClientSecret.trim()) {
      toast.error('Vui lòng nhập đầy đủ OAuth Client ID và Client Secret trước khi kết nối.');
      return;
    }

    setBusy(true);
    try {
      const saveRes = await fetch('/api/globals/backup-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authMethod: 'oauth2',
          oauthClientId: oauthClientId.trim(),
          oauthClientSecret: oauthClientSecret.trim(),
          driveFolderInput: driveFolderInput.trim(),
        }),
      });

      if (!saveRes.ok) {
        toast.error('Không thể lưu cấu hình OAuth.');
        setBusy(false);
        return;
      }

      window.location.href = '/api/backup/oauth/start';
    } catch {
      toast.error('Lỗi kết nối máy chủ.');
      setBusy(false);
    }
  };

  const handleTestDrive = async () => {
    setBusy(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/backup/test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authMethod,
          oauthClientId,
          oauthClientSecret,
          serviceAccountJson,
          driveFolderInput,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        const msg = `✅ Kết nối thành công (${json.email || 'Service Account'})${json.rootFolderName ? ` — Thư mục đích: "${json.rootFolderName}"` : ''}`;
        setTestResult(msg);
        toast.success('Kết nối Google Drive hoạt động tốt!');
      } else {
        const msg = `❌ ${json.error || 'Kết nối thất bại'}`;
        setTestResult(msg);
        toast.error(json.error || 'Kết nối thất bại');
      }
    } catch {
      toast.error('Lỗi khi kiểm tra Google Drive.');
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Ngắt kết nối tài khoản Google Drive hiện tại?')) return;
    setBusy(true);
    try {
      const res = await fetch('/api/backup/oauth/disconnect', { method: 'POST' });
      if (!res.ok) {
        toast.error('Không thể ngắt kết nối.');
        return;
      }
      dispatchFields({ type: 'UPDATE', path: 'oauthEmail', value: '' });
      setHasRefreshToken(false);
      setTestResult(null);
      toast.success('Đã ngắt kết nối tài khoản Google Drive.');
    } catch {
      toast.error('Lỗi khi ngắt kết nối.');
    } finally {
      setBusy(false);
    }
  };

  const isConnectedOAuth = Boolean(hasRefreshToken || oauthEmail);

  return (
    <div style={{ marginTop: '12px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        {authMethod === 'oauth2' && (
          <Button onClick={handleSaveAndConnectOAuth} disabled={busy} size="medium">
            {isConnectedOAuth ? 'Lưu & Đăng nhập lại Google Drive' : 'Lưu & Kết nối Google Drive'}
          </Button>
        )}

        <Button onClick={handleTestDrive} disabled={busy} buttonStyle="secondary" size="medium">
          Kiểm tra kết nối Drive
        </Button>

        {authMethod === 'oauth2' && isConnectedOAuth && (
          <Button onClick={handleDisconnect} disabled={busy} buttonStyle="subtle" size="medium">
            Ngắt kết nối ({oauthEmail || 'Google'})
          </Button>
        )}
      </div>

      {testResult && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            border: `1px solid ${testResult.startsWith('✅') ? '#16a34a' : '#dc2626'}`,
            backgroundColor: 'var(--theme-elevation-50)',
          }}
        >
          {testResult}
        </div>
      )}
    </div>
  );
};
