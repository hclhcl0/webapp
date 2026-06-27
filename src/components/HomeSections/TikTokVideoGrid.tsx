'use client';

import React, { useEffect, useRef } from 'react';

interface TikTokVideo {
  id: string;
  title: string;
  videoUrl: string;
  embedCode?: string;
}

function TikTokVideoEmbed({ video }: { video: TikTokVideo }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Nếu có embed code sẵn thì dùng luôn
    if (video.embedCode) {
      // Trích xuất video ID từ embedCode hoặc videoUrl
      containerRef.current.innerHTML = video.embedCode;
    } else {
      // Tự tạo embed từ URL
      const videoId = extractTikTokId(video.videoUrl);
      if (!videoId) return;
      containerRef.current.innerHTML = `
        <blockquote
          class="tiktok-embed"
          cite="${video.videoUrl}"
          data-video-id="${videoId}"
          style="max-width:325px; min-width:280px;"
        >
          <section>
            <a target="_blank" href="${video.videoUrl}">${video.title}</a>
          </section>
        </blockquote>
      `;
    }

    // Load TikTok embed.js
    const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    if (existingScript) {
      // Trigger re-render nếu script đã có
      (window as any).TikTok?.Embed?.render?.();
      existingScript.remove();
    }
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => { script.remove(); };
  }, [video.id, video.embedCode, video.videoUrl]);

  return (
    <div
      ref={containerRef}
      className="flex-shrink-0 w-[300px] overflow-hidden rounded-xl"
    />
  );
}

function extractTikTokId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

export default function TikTokVideoGrid({ videos, channelUrl }: { videos: TikTokVideo[]; channelUrl?: string }) {
  if (!videos.length) return (
    <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
      <p>Chưa có video TikTok nào. Hãy thêm video vào CMS với nền tảng TikTok.</p>
    </div>
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--primary) transparent',
        }}
      >
        {videos.map((video) => (
          <TikTokVideoEmbed key={video.id} video={video} />
        ))}
      </div>
      {channelUrl && (
        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#fe2c55',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
            </svg>
            Xem thêm trên TikTok →
          </a>
        </div>
      )}
    </div>
  );
}
