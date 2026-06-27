'use client';

import React from 'react';

const ROLES = [
  { label: '👑 Admin', value: 'admin' },
  { label: '✍️ Editor', value: 'editor' },
  { label: '🔍 Moderator', value: 'moderator' },
  { label: '📝 Author', value: 'author' },
];

const PERMISSIONS: {
  module: string;
  admin: string;
  editor: string;
  moderator: string;
  author: string;
  note?: string;
}[] = [
  {
    module: '📰 Bài viết',
    admin: 'Toàn quyền',
    editor: 'Xem/Sửa/Xóa theo chuyên mục',
    moderator: 'Xem/Sửa theo chuyên mục',
    author: 'Viết/Sửa bài của mình',
    note: 'Editor & Moderator & Author: nếu được phân chuyên mục → chỉ quản lý trong chuyên mục đó',
  },
  {
    module: '📁 Văn bản',
    admin: 'Toàn quyền',
    editor: 'Thêm/Sửa/Xóa',
    moderator: 'Thêm/Sửa',
    author: '❌',
  },
  {
    module: '🛒 Mua sắm',
    admin: 'Toàn quyền',
    editor: 'Thêm/Sửa/Xóa',
    moderator: 'Thêm/Sửa',
    author: '❌',
  },
  {
    module: '📋 Thủ tục HC',
    admin: 'Toàn quyền',
    editor: 'Thêm/Sửa/Xóa',
    moderator: 'Thêm/Sửa',
    author: '❌',
  },
  {
    module: '📅 Lịch công tác',
    admin: 'Toàn quyền',
    editor: 'Thêm/Sửa/Xóa',
    moderator: 'Thêm/Sửa',
    author: '❌',
  },
  {
    module: '🏥 Dịch vụ',
    admin: 'Toàn quyền',
    editor: 'Thêm/Sửa/Xóa',
    moderator: 'Thêm/Sửa',
    author: '❌',
  },
  {
    module: '🖼️ Hình ảnh/Media',
    admin: 'Toàn quyền',
    editor: 'Upload/Xóa',
    moderator: 'Upload',
    author: 'Upload',
  },
  {
    module: '🗂️ Chuyên mục',
    admin: 'Toàn quyền',
    editor: 'Thêm/Sửa',
    moderator: '❌',
    author: '❌',
  },
  {
    module: '🏷️ Tags / Từ khóa',
    admin: 'Toàn quyền',
    editor: 'Thêm/Sửa/Xóa',
    moderator: 'Thêm',
    author: 'Thêm',
  },
  {
    module: '📄 Trang tĩnh',
    admin: 'Toàn quyền',
    editor: 'Thêm/Sửa',
    moderator: '❌',
    author: '❌',
  },
  {
    module: '🖼 Banner',
    admin: 'Toàn quyền',
    editor: 'Thêm/Sửa/Xóa',
    moderator: '❌',
    author: '❌',
  },
  {
    module: '🎬 Video / Kênh',
    admin: 'Toàn quyền',
    editor: 'Thêm/Sửa',
    moderator: 'Thêm/Sửa',
    author: '❌',
  },
  {
    module: '📩 Form liên hệ',
    admin: 'Xem/Sửa/Xóa',
    editor: 'Xem/Sửa',
    moderator: 'Xem/Sửa',
    author: '❌',
    note: 'Người dùng ngoài website vẫn gửi form được (không cần đăng nhập)',
  },
  {
    module: '🏛️ Cơ cấu TC',
    admin: 'Toàn quyền',
    editor: 'Thêm/Sửa',
    moderator: '❌',
    author: '❌',
  },
  {
    module: '⚙️ Cài đặt hệ thống',
    admin: 'Toàn quyền',
    editor: '❌',
    moderator: '❌',
    author: '❌',
  },
  {
    module: '👤 Tài khoản',
    admin: 'Toàn quyền',
    editor: '❌',
    moderator: '❌',
    author: 'Xem thông tin mình',
  },
];

const cellStyle = (value: string): React.CSSProperties => {
  if (value === '❌') return { color: 'var(--theme-error-400, #ef4444)', fontWeight: 600 };
  if (value === 'Toàn quyền') return { color: 'var(--theme-success-400, #8b5cf6)', fontWeight: 700 };
  return { color: 'var(--theme-elevation-800, #374151)' };
};

export function UserPermissionsNote() {
  const [open, setOpen] = React.useState(false);

  return (
    <div
      style={{
        margin: '1rem 0',
        borderRadius: '4px',
        border: '1px solid var(--theme-elevation-150, #e5e7eb)',
        overflow: 'hidden',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '0.875rem',
        background: 'var(--theme-elevation-50, #ffffff)',
      }}
    >
      {/* Header – bấm để mở/đóng */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          background: 'var(--theme-elevation-100, #f8fafc)',
          border: 'none',
          cursor: 'pointer',
          borderBottom: open ? '1px solid var(--theme-elevation-150, #e5e7eb)' : 'none',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--theme-elevation-800, #1e293b)', fontSize: '0.9rem' }}>
          📊 Bảng phân quyền theo vai trò — Tham khảo khi tạo tài khoản
        </span>
        <span style={{ color: 'var(--theme-elevation-500, #64748b)', fontSize: '0.8rem' }}>{open ? '▲ Đóng' : '▼ Mở xem chi tiết'}</span>
      </button>

      {open && (
        <div style={{ overflowX: 'auto', padding: '0.5rem 0' }}>
          {/* Chú thích vai trò */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.5rem 1.25rem 0.75rem' }}>
            {[
              { icon: '👑', role: 'Admin', desc: 'Toàn quyền hệ thống, quản lý tài khoản' },
              { icon: '✍️', role: 'Editor', desc: 'Biên tập & xuất bản nội dung theo chuyên mục' },
              { icon: '🔍', role: 'Moderator', desc: 'Kiểm duyệt bài viết, không xóa được' },
              { icon: '📝', role: 'Author', desc: 'Viết bài trong chuyên mục được phân công' },
            ].map((r) => (
              <div
                key={r.role}
                style={{
                  background: 'var(--theme-elevation-100, #f1f5f9)',
                  borderRadius: '4px',
                  padding: '0.4rem 0.75rem',
                  display: 'flex',
                  gap: '0.4rem',
                  alignItems: 'center',
                }}
              >
                <span>{r.icon}</span>
                <strong style={{ color: 'var(--theme-elevation-800, #1e293b)' }}>{r.role}:</strong>
                <span style={{ color: 'var(--theme-elevation-500, #64748b)' }}>{r.desc}</span>
              </div>
            ))}
          </div>

          {/* Bảng */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '700px',
            }}
          >
            <thead>
              <tr style={{ background: 'var(--theme-elevation-100, #f1f5f9)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1.25rem', color: 'var(--theme-elevation-800, #475569)', fontWeight: 600, borderBottom: '1px solid var(--theme-elevation-150, #e2e8f0)', width: '22%' }}>
                  Chức năng / Module
                </th>
                {ROLES.map((r) => (
                  <th key={r.value} style={{ textAlign: 'center', padding: '0.75rem 0.5rem', color: 'var(--theme-elevation-800, #475569)', fontWeight: 600, borderBottom: '1px solid var(--theme-elevation-150, #e2e8f0)' }}>
                    {r.label}
                  </th>
                ))}
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--theme-elevation-800, #475569)', fontWeight: 600, borderBottom: '1px solid var(--theme-elevation-150, #e2e8f0)', width: '25%' }}>
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((row, i) => (
                <tr
                  key={row.module}
                  style={{ background: i % 2 === 0 ? 'transparent' : 'var(--theme-elevation-50, #f8fafc)', borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)' }}
                >
                  <td style={{ padding: '0.5rem 1.25rem', fontWeight: 600, color: 'var(--theme-elevation-800, #0f172a)' }}>{row.module}</td>
                  {ROLES.map((r) => (
                    <td
                      key={r.value}
                      style={{
                        textAlign: 'center',
                        padding: '0.5rem 0.5rem',
                        ...cellStyle(row[r.value as keyof typeof row] as string),
                        fontSize: '0.8rem',
                      }}
                    >
                      {row[r.value as keyof typeof row] as string}
                    </td>
                  ))}
                  <td style={{ padding: '0.5rem 1rem', color: 'var(--theme-elevation-500, #64748b)', fontStyle: 'italic', fontSize: '0.78rem' }}>
                    {row.note || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding: '0.75rem 1.25rem', color: 'var(--theme-elevation-500, #94a3b8)', fontSize: '0.78rem', borderTop: '1px solid var(--theme-elevation-150, #f1f5f9)' }}>
            💡 Tip: Khi tạo tài khoản với vai trò <strong style={{ color: 'var(--theme-elevation-800)' }}>Editor / Moderator / Author</strong>, hãy chọn thêm <strong style={{ color: 'var(--theme-elevation-800)' }}>"Chuyên mục được phân công"</strong> ở sidebar bên phải.
            Nếu để trống → không giới hạn chuyên mục (áp dụng cho toàn bộ nội dung).
          </div>
        </div>
      )}
    </div>
  );
}
