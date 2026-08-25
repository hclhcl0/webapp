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
          minWidth: '46px',
          minHeight: '46px',
          objectFit: 'contain',
          display: 'block',
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '0.95rem',
            fontWeight: 800,
            color: 'var(--theme-text)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            lineHeight: 1.2,
          }}
        >
          CDC Đà Nẵng
        </h2>
        <p
          style={{
            margin: '0.15rem 0 0 0',
            fontSize: '0.68rem',
            color: 'var(--theme-text)',
            opacity: 0.65,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            lineHeight: 1.2,
          }}
        >
          Hệ Thống Quản Trị Cổng TTĐT
        </p>
      </div>
    </div>
  )
}
