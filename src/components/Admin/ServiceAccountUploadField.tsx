'use client';

import React from 'react';
import { toast, useForm } from '@payloadcms/ui';

export const ServiceAccountUploadField: React.FC = () => {
  const { dispatchFields } = useForm();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.client_email || !parsed.private_key) {
        toast.error('File JSON không đúng định dạng Google Service Account.');
        return;
      }
      dispatchFields({
        type: 'UPDATE',
        path: 'serviceAccountJson',
        value: text,
      });
      toast.success(`Đã nạp khóa Service Account: ${parsed.client_email}. Nhớ bấm Lưu!`);
    } catch {
      toast.error('Không thể đọc file JSON hợp lệ.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px' }}>
        Chọn file khóa Service Account (.json) từ máy tính:
      </label>
      <input type="file" accept=".json,application/json" onChange={handleFileChange} />
      <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
        Lưu ý: Service Account chỉ có dung lượng lưu trữ khi dùng với <strong>Google Workspace Shared Drive</strong> (tài khoản Gmail cá nhân miễn phí cần dùng phương thức <strong>OAuth 2.0</strong>).
      </div>
    </div>
  );
};
