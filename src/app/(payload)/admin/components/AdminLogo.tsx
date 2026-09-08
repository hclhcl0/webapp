'use client'

import React from 'react'

export const AdminLogo = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0 0.5rem 0.5rem 0.5rem',
        margin: '0',
        width: '100%',
      }}
    >
      <img
        src="/logo.png"
        alt="CDC Đà Nẵng"
        width={46}
        height={46}
        style={{
          width: '46px',
          height: '46px',
          objectFit: 'contain',
          display: 'block',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          lineHeight: '1.2',
        }}
      >
        <span
          style={{
            fontSize: '0.95rem',
            fontWeight: 800,
            color: 'var(--theme-text)',
            letterSpacing: '0.05em',
          }}
        >
          CDC ĐÀ NẴNG
        </span>
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color: 'var(--theme-elevation-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          Hệ thống Quản trị
        </span>
      </div>
    </div>
  )
}

export default AdminLogo
