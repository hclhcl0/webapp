'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Channel {
  id: string;
  handle: string;
  channelName: string;
  channelUrl?: string;
  avatarUrl?: string;
}

interface TikTokTabsProps {
  channels: Channel[];
}

function TikTokFeed({ handle }: { handle: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !handle) return;

    const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    if (existingScript) existingScript.remove();

    containerRef.current.innerHTML = `
      <blockquote
        class="tiktok-embed"
        cite="https://www.tiktok.com/@${handle}"
        data-unique-id="${handle}"
        data-embed-type="creator"
        style="max-width:100%; min-width:288px;"
      >
        <section>
          <a target="_blank" href="https://www.tiktok.com/@${handle}">@${handle}</a>
        </section>
      </blockquote>
    `;

    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => { script.remove(); };
  }, [handle]);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Dịch lên để ẩn phần profile TikTok phía trên, scale to lên */}
      <div style={{ 
        marginTop: '-250px', 
        transform: 'scale(1.15)', 
        transformOrigin: 'top center',
        paddingBottom: '20px' // Bù thêm phần dưới do bị scale dài ra
      }}>
        <div ref={containerRef} style={{ width: '100%' }} />
      </div>
      {/* Overlay trắng phủ phần chữ phía dưới (TikTok branding + policy) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '90px',
        background: 'linear-gradient(to bottom, transparent 0%, white 40%)',
        pointerEvents: 'none',
        zIndex: 10,
      }} />
    </div>
  );
}

function sanitizeHandle(raw: string): string {
  let clean = raw?.trim() || '';
  if (clean.includes('?')) clean = clean.split('?')[0];
  if (clean.includes('/')) {
    const parts = clean.split('/').filter(Boolean);
    clean = parts[parts.length - 1];
  }
  if (clean.startsWith('@')) clean = clean.substring(1);
  return clean;
}

export default function TikTokChannelEmbed({ channels }: TikTokTabsProps) {
  const sanitizedChannels = channels
    .map(ch => ({ ...ch, handle: sanitizeHandle(ch.handle) }))
    .filter(ch => ch.handle.length > 0);

  const [activeIdx, setActiveIdx] = useState(0);
  const active = sanitizedChannels[activeIdx];

  if (!active || sanitizedChannels.length === 0) return null;

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid var(--border, #e5e7eb)',
      /* Tràn ra 2 bên vượt container */
      margin: '0 -1.5rem',
    }}>
      {/* Tab chọn kênh — chỉ hiện khi có nhiều kênh */}
      {sanitizedChannels.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid var(--border, #e5e7eb)',
          flexWrap: 'wrap',
        }}>
          {sanitizedChannels.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => setActiveIdx(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
                border: '1.5px solid',
                borderColor: idx === activeIdx ? '#fe2c55' : '#e5e7eb',
                background: idx === activeIdx ? '#fe2c55' : 'white',
                color: idx === activeIdx ? 'white' : '#374151',
                fontWeight: idx === activeIdx ? 700 : 400,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {ch.avatarUrl && (
                <img src={ch.avatarUrl} alt={ch.channelName}
                  style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
              )}
              {ch.channelName}
            </button>
          ))}
        </div>
      )}

      {/* Feed video TikTok */}
      <TikTokFeed key={active.handle} handle={active.handle} />

      {/* Footer link */}
      <div style={{
        padding: '0.5rem 1.5rem',
        background: 'white',
        borderTop: '1px solid var(--border, #e5e7eb)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <a
          href={active.channelUrl || `https://www.tiktok.com/@${active.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#fe2c55', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}
        >
          Xem tất cả trên TikTok →
        </a>
      </div>
    </div>
  );
}
