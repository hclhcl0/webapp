'use client';

import { useState, useEffect } from 'react';

interface ZaloUser {
  zaloUserId: string;
  displayName: string;
  avatarUrl?: string;
}

interface ZaloLoginButtonProps {
  size?: 'small' | 'medium' | 'large';
  showUserInfo?: boolean;
  className?: string;
}

export default function ZaloLoginButton({
  size = 'medium',
  showUserInfo = true,
  className = '',
}: ZaloLoginButtonProps) {
  const [user, setUser] = useState<ZaloUser | null>(null);

  // Đọc cookie zl_user khi component mount (set bởi callback Zalo Login)
  useEffect(() => {
    try {
      const raw = document.cookie
        .split('; ')
        .find(r => r.startsWith('zl_user='))
        ?.split('=')[1];
      if (raw) {
        const data = JSON.parse(atob(decodeURIComponent(raw)));
        setUser(data);
      }
    } catch {}
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/zalo-login';
  };

  const handleLogout = () => {
    // Xóa cookie zl_user
    document.cookie = 'zl_user=; Max-Age=0; path=/';
    setUser(null);
  };

  const sizeMap = {
    small:  { padding: '7px 14px', fontSize: '0.8rem', iconSize: 18, gap: 6 },
    medium: { padding: '10px 20px', fontSize: '0.9rem', iconSize: 22, gap: 8 },
    large:  { padding: '13px 26px', fontSize: '1rem', iconSize: 26, gap: 10 },
  };
  const s = sizeMap[size];

  if (user && showUserInfo) {
    return (
      <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '50px' }}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0068ff,#00b4d8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
              {user.displayName?.[0]?.toUpperCase() || 'Z'}
            </div>
          )}
          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0369a1' }}>
            {user.displayName}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        padding: s.padding,
        background: '#0068ff',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        fontSize: s.fontSize,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 4px 14px rgba(0,104,255,0.35)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = '#0057d9';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = '#0068ff';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Zalo Logo SVG */}
      <svg width={s.iconSize} height={s.iconSize} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="white" fillOpacity="0.2"/>
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="26" fontWeight="900" fill="white" fontFamily="Arial">Z</text>
      </svg>
      Đăng nhập với Zalo
    </button>
  );
}
