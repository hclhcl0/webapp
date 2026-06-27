'use client';
import React, { useState } from 'react';
import { useForm, useDocumentInfo } from '@payloadcms/ui';

export const SyncVideoButton: React.FC = () => {
  const { id } = useDocumentInfo();
  const { getFields } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    if (!id) {
      setMessage('Vui lòng lưu Kênh Video lần đầu tiên trước khi đồng bộ.');
      return;
    }
    const fields = getFields();
    if (fields.platform?.value !== 'youtube') {
      setMessage('Tính năng đồng bộ hiện chỉ hỗ trợ nền tảng YouTube.');
      return;
    }
    if (!fields.channelId?.value) {
      setMessage('Bạn chưa nhập Channel ID của YouTube.');
      return;
    }

    setLoading(true);
    setMessage('Đang kết nối YouTube...');

    try {
      const res = await fetch(`/api/video-channels/sync/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: fields.channelId.value }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`Đồng bộ thành công! Đã thêm ${data.newVideos} video mới.`);
      } else {
        setMessage(`Lỗi: ${data.error || 'Không xác định'}`);
      }
    } catch (e: any) {
      setMessage(`Lỗi kết nối: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px', padding: '15px 0', borderTop: '1px solid var(--theme-elevation-100)', borderBottom: '1px solid var(--theme-elevation-100)' }}>
      <h4 style={{ margin: '0 0 8px', fontSize: '15px' }}>Đồng bộ Video từ YouTube</h4>
      <p style={{ margin: '0 0 15px', fontSize: '13px', opacity: 0.7 }}>
        Lấy các video mới nhất từ YouTube thông qua RSS Feed và tự động thêm vào Thư viện Video.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          type="button"
          onClick={handleSync}
          disabled={loading}
          style={{
            background: loading ? 'var(--theme-elevation-200)' : 'var(--theme-success-400)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Đang đồng bộ...' : '🔄 Bắt đầu Đồng bộ'}
        </button>
        {message && (
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 500,
            color: message.includes('Lỗi') ? 'var(--theme-error-400)' : 'var(--theme-success-400)'
          }}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
};
