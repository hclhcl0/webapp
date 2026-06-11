'use client'

import React from 'react'

export const AdminLogo = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
      <img 
        src="/logo.png" 
        alt="CDC Đà Nẵng" 
        style={{ width: '90px', height: '90px', objectFit: 'contain' }}
        onError={(e) => {
          // Ẩn ảnh nếu file logo.png bị lỗi 404
          e.currentTarget.style.display = 'none';
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.35rem', 
          fontWeight: 700, 
          color: 'var(--theme-elevation-800)', 
          letterSpacing: '0.03em',
          textTransform: 'uppercase'
        }}>
          CDC Đà Nẵng
        </h2>
        <p style={{ 
          margin: '0.25rem 0 0 0', 
          fontSize: '0.85rem', 
          color: 'var(--theme-elevation-500)', 
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Hệ Thống Quản Trị Cổng TTĐT
        </p>
      </div>
    </div>
  )
}
