'use client'

import React from 'react'
import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'

export const AuthorWelcome = () => {
  const { user } = useAuth()

  // Chỉ hiển thị cho role author (Cộng tác viên)
  if (!user || user.role !== 'author') {
    return null
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: 'var(--theme-elevation-50)', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--theme-elevation-150)', fontFamily: 'Inter, sans-serif' }}>
      <h2 style={{ margin: '0 0 1rem 0', color: 'var(--theme-text)', fontSize: '1.5rem', fontWeight: 'bold' }}>
        👋 Chào mừng Cộng tác viên, {user.name || user.email}!
      </h2>
      <p style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', color: 'var(--theme-text)', opacity: 0.85, lineHeight: 1.6 }}>
        Đây là giao diện đăng bài viết dành riêng cho Cộng tác viên. Bạn có thể tự do soạn thảo văn bản, lưu lại bản nháp và sau đó gửi bài viết. Các Biên tập viên của tòa soạn sẽ tiếp nhận, kiểm duyệt và xuất bản bài viết của bạn.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link 
          href="/admin/collections/articles/create" 
          style={{ 
            background: 'var(--tw-primary, #0284c7)', 
            color: 'white', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '6px', 
            textDecoration: 'none', 
            fontWeight: '600',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>✍️</span> Viết bài mới ngay
        </Link>
        <Link 
          href="/admin/collections/articles?limit=10&where[author][equals]=me" 
          style={{ 
            background: 'var(--theme-elevation-100)', 
            color: 'var(--theme-text)', 
            border: '1px solid var(--theme-elevation-200)', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '6px', 
            textDecoration: 'none', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>📝</span> Quản lý Bài viết của tôi
        </Link>
        <Link 
          href="/admin/collections/media" 
          style={{ 
            background: 'var(--theme-elevation-100)', 
            color: 'var(--theme-text)', 
            border: '1px solid var(--theme-elevation-200)', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '6px', 
            textDecoration: 'none', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>🖼️</span> Tải ảnh lên
        </Link>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--theme-elevation-100)', borderRadius: '6px', border: '1px dashed var(--theme-elevation-200)' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--theme-text)' }}>💡 Mẹo vặt khi viết bài:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--theme-text)', fontSize: '0.95rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Luôn chọn <b>Chuyên mục</b> phù hợp và thêm <b>Ảnh đại diện (Thumbnail)</b> để bài viết hấp dẫn hơn.</li>
          <li style={{ marginBottom: '0.5rem' }}>Bạn chỉ có thể lưu ở trạng thái <b>Draft (Nháp)</b>. Trạng thái Published sẽ bị tòa soạn hạ xuống nếu bạn cố tình chọn.</li>
          <li>Khi copy nội dung từ Word, hệ thống đã tự động làm sạch font chữ để bài viết hiển thị chuẩn nhất trên website.</li>
        </ul>
      </div>
    </div>
  )
}
