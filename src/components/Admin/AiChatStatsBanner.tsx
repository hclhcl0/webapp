'use client';

import React, { useEffect, useState } from 'react';

interface StatsData {
  total: number;
  answered: number;
  unansweredPending: number;
  helpful: number;
  notHelpful: number;
}

export function AiChatStatsBanner() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const [totalRes, answeredRes, unansweredRes, helpfulRes, notHelpfulRes] = await Promise.all([
          fetch('/api/ai-chat-logs?limit=0', { credentials: 'include' }),
          fetch('/api/ai-chat-logs?where[status][equals]=answered&limit=0', { credentials: 'include' }),
          fetch('/api/ai-chat-logs?where[status][equals]=unanswered&where[isResolved][equals]=false&limit=0', { credentials: 'include' }),
          fetch('/api/ai-chat-logs?where[feedback][equals]=helpful&limit=0', { credentials: 'include' }),
          fetch('/api/ai-chat-logs?where[feedback][equals]=not_helpful&limit=0', { credentials: 'include' }),
        ]);

        const [totalJson, answeredJson, unansweredJson, helpfulJson, notHelpfulJson] = await Promise.all([
          totalRes.ok ? totalRes.json() : { totalDocs: 0 },
          answeredRes.ok ? answeredRes.json() : { totalDocs: 0 },
          unansweredRes.ok ? unansweredRes.json() : { totalDocs: 0 },
          helpfulRes.ok ? helpfulRes.json() : { totalDocs: 0 },
          notHelpfulRes.ok ? notHelpfulRes.json() : { totalDocs: 0 },
        ]);

        if (isMounted) {
          setStats({
            total: totalJson.totalDocs ?? 0,
            answered: answeredJson.totalDocs ?? 0,
            unansweredPending: unansweredJson.totalDocs ?? 0,
            helpful: helpfulJson.totalDocs ?? 0,
            notHelpful: notHelpfulJson.totalDocs ?? 0,
          });
        }
      } catch (err) {
        console.error('[AiChatStatsBanner] Error loading stats:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const answerRate = stats && stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 100;

  return (
    <div
      style={{
        margin: '0.75rem 0 1.25rem',
        padding: '1.1rem 1.25rem',
        borderRadius: '8px',
        border: '1px solid var(--theme-elevation-150, #e2e8f0)',
        background: 'var(--theme-elevation-50, #ffffff)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--theme-elevation-900, #0f172a)' }}>
            🤖 Thống kê Hoạt động & Chất lượng Trợ lý AI CDC Đà Nẵng
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--theme-elevation-500, #64748b)' }}>
            Hệ thống tự động phát hiện các câu hỏi AI chưa có dữ liệu trả lời để cán bộ bổ sung vào Kho tri thức.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <a
            href="/admin/collections/ai-chat-logs?where[or][0][and][0][status][equals]=unanswered&where[or][0][and][1][isResolved][equals]=false"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
            }}
          >
            ⚠️ Lọc câu hỏi thiếu tri thức ({loading ? '...' : stats?.unansweredPending ?? 0})
          </a>
          <a
            href="/admin/collections/ai-chat-logs?where[or][0][and][0][feedback][equals]=not_helpful"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
            }}
          >
            👎 Lọc đánh giá chưa hài lòng ({loading ? '...' : stats?.notHelpful ?? 0})
          </a>
          <a
            href="/admin/collections/ai-knowledge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              background: '#0d9488',
              color: '#ffffff',
            }}
          >
            📚 Mở Kho tri thức AI
          </a>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '0.85rem',
        }}
      >
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '6px',
            background: 'var(--theme-elevation-100, #f8fafc)',
            borderLeft: '4px solid #0284c7',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--theme-elevation-500, #64748b)', fontWeight: 600 }}>
            TỔNG CÂU HỎI TIẾP NHẬN
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--theme-elevation-900, #0f172a)', marginTop: '0.2rem' }}>
            {loading ? '...' : stats?.total ?? 0}
          </div>
        </div>

        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '6px',
            background: 'var(--theme-elevation-100, #f8fafc)',
            borderLeft: '4px solid #16a34a',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--theme-elevation-500, #64748b)', fontWeight: 600 }}>
            ĐÃ TRẢ LỜI THÀNH CÔNG
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d', marginTop: '0.2rem' }}>
            {loading ? '...' : `${stats?.answered ?? 0} (${answerRate}%)`}
          </div>
        </div>

        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '6px',
            background: 'var(--theme-elevation-100, #f8fafc)',
            borderLeft: '4px solid #d97706',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--theme-elevation-500, #64748b)', fontWeight: 600 }}>
            CHỜ BỔ SUNG TRI THỨC
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b45309', marginTop: '0.2rem' }}>
            {loading ? '...' : stats?.unansweredPending ?? 0}
          </div>
        </div>

        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '6px',
            background: 'var(--theme-elevation-100, #f8fafc)',
            borderLeft: '4px solid #7c3aed',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--theme-elevation-500, #64748b)', fontWeight: 600 }}>
            PHẢN HỒI NGƯỜI DÂN
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--theme-elevation-900, #0f172a)', marginTop: '0.35rem', display: 'flex', gap: '1rem' }}>
            <span style={{ color: '#15803d' }}>👍 {loading ? '...' : stats?.helpful ?? 0}</span>
            <span style={{ color: '#dc2626' }}>👎 {loading ? '...' : stats?.notHelpful ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiChatStatsBanner;
