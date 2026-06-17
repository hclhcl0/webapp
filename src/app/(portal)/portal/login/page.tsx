'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/portal/broadcast';
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(
    error === 'unauthorized' ? 'Tài khoản của bạn không có quyền truy cập Portal.' : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.token) {
        setErr(data?.errors?.[0]?.message || 'Email hoặc mật khẩu không đúng.');
        return;
      }

      // Payload tự set cookie payload-token, redirect về trang cần vào
      router.push(from);
      router.refresh();
    } catch {
      setErr('Không kết nối được máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '20px',
        padding: '40px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #0068ff, #00b4d8)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(0,104,255,0.4)',
          }}>🏥</div>
          <h1 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 6px' }}>
            Cổng nhân viên
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', margin: 0 }}>
            CDC Đà Nẵng — Hệ thống nội bộ
          </p>
        </div>

        {/* Error */}
        {err && (
          <div style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '10px',
            padding: '12px 14px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex', alignItems: 'flex-start', gap: '8px',
          }}>
            <span>⚠️</span><span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="ten@cdcdanang.vn"
              style={{
                width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#0068ff'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '11px 44px 11px 14px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#0068ff'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1rem' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              padding: '12px', background: loading ? 'rgba(0,104,255,0.5)' : '#0068ff',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background 0.2s',
              marginTop: '4px',
            }}
          >
            {loading
              ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Đang đăng nhập...</>
              : '🔐 Đăng nhập'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '24px', marginBottom: 0 }}>
          Chỉ dành cho nhân viên CDC Đà Nẵng được cấp quyền.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
