'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'

type Stats = {
  articles: number
  users: number
  media: number
  pendingArticles: number
}

type RecentArticle = {
  id: string | number
  title: string
  _status?: 'published' | 'draft'
  category?: { name: string } | null
  createdAt: string
}

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return '🌅 Chúc buổi sáng tốt lành'
  if (hour < 18) return '☀️ Chúc buổi chiều làm việc hiệu quả'
  return '🌙 Chúc buổi tối an lành'
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// ─────────────────────────────────────────────
// Recent Articles Feed Component
// ─────────────────────────────────────────────
const RecentArticlesList = () => {
  const [articles, setArticles] = useState<RecentArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/articles?limit=5&depth=1&sort=-createdAt')
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.docs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div
      style={{
        marginTop: '2rem',
        backgroundColor: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: '700',
            color: 'var(--theme-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>📋</span> Bài viết cập nhật gần đây
        </h3>
        <Link
          href="/admin/collections/articles"
          style={{
            fontSize: '0.85rem',
            color: 'var(--tw-primary, #0284c7)',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          Xem tất cả bài viết &rarr;
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--theme-text)', opacity: 0.6, fontSize: '0.9rem' }}>
          ⏳ Đang tải bài viết mới...
        </div>
      ) : articles.length === 0 ? (
        <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--theme-text)', opacity: 0.6, fontSize: '0.9rem' }}>
          Chưa có bài viết nào trong hệ thống.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {articles.map((item) => {
            const isDraft = item._status === 'draft'
            return (
              <Link
                key={item.id}
                href={`/admin/collections/articles/${item.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.8rem 1rem',
                  backgroundColor: 'var(--theme-elevation-100)',
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.15s ease',
                  flexWrap: 'wrap',
                  gap: '0.6rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 280px', minWidth: 0 }}>
                  <span
                    style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      letterSpacing: '0.02em',
                      backgroundColor: isDraft ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: isDraft ? '#f59e0b' : '#10b981',
                      border: `1px solid ${isDraft ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isDraft ? 'Bản nháp' : 'Xuất bản'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: '600',
                      color: 'var(--theme-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.8rem',
                    color: 'var(--theme-text)',
                    opacity: 0.65,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.category && <span>📁 {item.category.name}</span>}
                  <span>🕒 {formatDate(item.createdAt)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Admin / Moderator Dashboard
// ─────────────────────────────────────────────
const AdminDashboard = ({ user }: { user: any }) => {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [articlesRes, usersRes, mediaRes, pendingRes] = await Promise.all([
          fetch('/api/articles?limit=0&depth=0'),
          fetch('/api/users?limit=0&depth=0'),
          fetch('/api/media?limit=0&depth=0'),
          fetch('/api/articles?limit=0&depth=0&where[_status][equals]=draft'),
        ])
        const [articles, users, media, pending] = await Promise.all([
          articlesRes.json(),
          usersRes.json(),
          mediaRes.json(),
          pendingRes.json(),
        ])
        setStats({
          articles: articles.totalDocs ?? 0,
          users: users.totalDocs ?? 0,
          media: media.totalDocs ?? 0,
          pendingArticles: pending.totalDocs ?? 0,
        })
      } catch {
        // Fallback im lặng nếu offline
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Tổng bài viết', value: stats?.articles ?? '...', icon: '📰', href: '/admin/collections/articles', color: '#0ea5e9' },
    { label: 'Bài chờ duyệt', value: stats?.pendingArticles ?? '...', icon: '⏳', href: '/admin/collections/articles?where[_status][equals]=draft', color: '#f59e0b' },
    { label: 'Người dùng', value: stats?.users ?? '...', icon: '👥', href: '/admin/collections/users', color: '#8b5cf6' },
    { label: 'File Media', value: stats?.media ?? '...', icon: '🖼️', href: '/admin/collections/media', color: '#10b981' },
  ]

  return (
    <div style={{ padding: '1.5rem 1rem', fontFamily: 'Inter, sans-serif', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          marginBottom: '1.5rem',
          padding: '1.5rem 1.75rem',
          backgroundColor: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--tw-primary, #0ea5e9)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            {getTimeGreeting()}
          </div>
          <h2 style={{ margin: 0, color: 'var(--theme-text)', fontSize: '1.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👑</span> {user.name || user.email}
          </h2>
          <p style={{ margin: '0.35rem 0 0 0', color: 'var(--theme-text)', opacity: 0.7, fontSize: '0.92rem' }}>
            Hệ thống Quản trị Cổng thông tin CDC Đà Nẵng
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link
            href="/admin/collections/articles/create"
            style={{
              padding: '0.75rem 1.35rem',
              minHeight: '44px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#0ea5e9',
              color: 'white',
              boxShadow: '0 2px 6px rgba(14, 165, 233, 0.3)',
            }}
          >
            <span>✍️</span> Viết bài mới
          </Link>
          <Link
            href="/admin/globals/site-settings"
            style={{
              padding: '0.75rem 1.2rem',
              minHeight: '44px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--theme-elevation-100)',
              color: 'var(--theme-text)',
              border: '1px solid var(--theme-elevation-200)',
            }}
          >
            <span>⚙️</span> Cài đặt
          </Link>
        </div>
      </div>

      {/* Responsive Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: 'var(--theme-elevation-50)',
                border: '1px solid var(--theme-elevation-150)',
                borderLeft: `5px solid ${card.color}`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease-out',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--theme-text)', opacity: 0.75, fontWeight: '600' }}>{card.label}</span>
                <span style={{ fontSize: '1.3rem' }}>{card.icon}</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: card.color, lineHeight: 1.1 }}>{card.value}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Nav Actions */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '10px',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--theme-text)', opacity: 0.8, marginRight: '0.5rem' }}>
          🚀 Phím tắt nhanh:
        </span>
        {[
          { href: '/admin/collections/users/create', label: '➕ Thêm người dùng' },
          { href: '/admin/collections/banners', label: '🎨 Quản lý Banner' },
          { href: '/admin/collections/documents', label: '📂 Văn bản chỉ đạo' },
          { href: '/admin/collections/vaccines', label: '💉 Danh mục Vắc xin' },
        ].map((btn) => (
          <Link
            key={btn.href}
            href={btn.href}
            style={{
              padding: '0.5rem 1rem',
              minHeight: '38px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--theme-elevation-100)',
              color: 'var(--theme-text)',
              border: '1px solid var(--theme-elevation-200)',
            }}
          >
            {btn.label}
          </Link>
        ))}
      </div>

      {/* Recent Articles */}
      <RecentArticlesList />
    </div>
  )
}

// ─────────────────────────────────────────────
// Editor Dashboard
// ─────────────────────────────────────────────
const EditorDashboard = ({ user }: { user: any }) => {
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/articles?limit=0&depth=0&where[_status][equals]=draft')
      .then((r) => r.json())
      .then((data) => setPendingCount(data.totalDocs ?? 0))
      .catch(() => {})
  }, [])

  return (
    <div style={{ padding: '1.5rem 1rem', fontFamily: 'Inter, sans-serif', maxWidth: '1440px', margin: '0 auto' }}>
      <div
        style={{
          marginBottom: '1.5rem',
          padding: '1.5rem 1.75rem',
          backgroundColor: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-150)',
          borderLeft: '5px solid #10b981',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            {getTimeGreeting()}
          </div>
          <h2 style={{ margin: 0, color: 'var(--theme-text)', fontSize: '1.5rem', fontWeight: '800' }}>
            ✏️ Biên tập viên, {user.name || user.email}
          </h2>
          <p style={{ margin: '0.35rem 0 0 0', color: 'var(--theme-text)', opacity: 0.8, fontSize: '0.95rem' }}>
            Hệ thống đang có{' '}
            <strong style={{ color: pendingCount && pendingCount > 0 ? '#f59e0b' : '#10b981', fontSize: '1.05rem' }}>
              {pendingCount === null ? '...' : pendingCount} bài viết bản nháp / chờ duyệt
            </strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link
            href="/admin/collections/articles?where[_status][equals]=draft"
            style={{
              padding: '0.75rem 1.35rem',
              minHeight: '44px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#f59e0b',
              color: '#000',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)',
            }}
          >
            <span>⏳</span> Duyệt bài nháp ({pendingCount ?? '...'})
          </Link>
          <Link
            href="/admin/collections/articles/create"
            style={{
              padding: '0.75rem 1.2rem',
              minHeight: '44px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#10b981',
              color: 'white',
            }}
          >
            <span>✍️</span> Viết bài mới
          </Link>
        </div>
      </div>

      <RecentArticlesList />
    </div>
  )
}

// ─────────────────────────────────────────────
// Author Dashboard
// ─────────────────────────────────────────────
const AuthorDashboard = ({ user }: { user: any }) => (
  <div style={{ padding: '1.5rem 1rem', fontFamily: 'Inter, sans-serif', maxWidth: '1440px', margin: '0 auto' }}>
    <div
      style={{
        padding: '1.75rem',
        backgroundColor: 'var(--theme-elevation-50)',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        border: '1px solid var(--theme-elevation-150)',
        borderLeft: '5px solid #0284c7',
      }}
    >
      <div style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
        {getTimeGreeting()}
      </div>
      <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-text)', fontSize: '1.5rem', fontWeight: '800' }}>
        👋 Chào mừng Cộng tác viên, {user.name || user.email}!
      </h2>
      <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', color: 'var(--theme-text)', opacity: 0.85, lineHeight: 1.6 }}>
        Đây là giao diện đăng bài dành riêng cho Cộng tác viên. Bạn có thể soạn thảo, lưu bản nháp và gửi bài. Ban biên tập sẽ kiểm duyệt và xuất bản bài viết của bạn lên website.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { href: '/admin/collections/articles/create', label: '✍️ Viết bài mới ngay', primary: true },
          { href: '/admin/collections/articles', label: '📝 Quản lý Bài viết của tôi', primary: false },
          { href: '/admin/collections/media', label: '🖼️ Thư viện ảnh / Tải ảnh', primary: false },
        ].map((btn) => (
          <Link
            key={btn.href}
            href={btn.href}
            style={{
              padding: '0.75rem 1.4rem',
              minHeight: '44px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: btn.primary ? '#0284c7' : 'var(--theme-elevation-100)',
              color: btn.primary ? 'white' : 'var(--theme-text)',
              border: btn.primary ? 'none' : '1px solid var(--theme-elevation-200)',
              boxShadow: btn.primary ? '0 2px 6px rgba(2, 132, 199, 0.3)' : 'none',
            }}
          >
            {btn.label}
          </Link>
        ))}
      </div>

      <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--theme-elevation-100)', borderRadius: '8px', border: '1px dashed var(--theme-elevation-200)' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--theme-text)', fontWeight: '700' }}>💡 Mẹo khi viết bài:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--theme-text)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          <li>Luôn chọn đúng <b>Chuyên mục</b> và thêm <b>Ảnh đại diện</b> để bài viết hiển thị đẹp mắt.</li>
          <li>Bạn lưu bài ở trạng thái <b>Draft (Nháp)</b>, Biên tập viên sẽ kiểm tra và bấm Xuất bản.</li>
          <li>Khi sao chép nội dung từ Microsoft Word, hệ thống sẽ tự động tối ưu hóa font chữ sạch sẽ.</li>
        </ul>
      </div>
    </div>
  </div>
)

// ─────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────
export const DashboardWelcome = () => {
  const { user } = useAuth()

  if (!user) return null

  switch (user.role) {
    case 'admin':
    case 'moderator':
      return <AdminDashboard user={user} />
    case 'editor':
      return <EditorDashboard user={user} />
    case 'author':
      return <AuthorDashboard user={user} />
    default:
      return null
  }
}
