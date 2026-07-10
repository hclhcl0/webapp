import React from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { TikTokSidebarSlot } from './NewsSidebarLayout/TikTokSidebarSlot';

interface SidebarRendererProps {
  widgets?: any[];
  latestArticles: any[];
  categories: any[];
}

export function SidebarRenderer({ widgets, latestArticles, categories }: SidebarRendererProps) {
  if (!widgets || widgets.length === 0) return null;

  return (
    <aside className="space-y-8 min-w-0 lg:sticky lg:top-8 self-start no-print w-full">
      {widgets.map((widget: any, index: number) => {
        const key = widget.id || index;

        switch (widget.blockType) {
          // 1. Render Chuyên mục
          case 'categoriesWidget':
            const limitCat = widget.limit || 10;
            return (
              <div key={key} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-5 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gov-primary"></div>
                <h3 className="text-[1.1rem] font-bold text-gov-primary border-b-2 border-gov-primary/20 pb-3 mb-5 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-6 bg-gov-primary rounded-sm inline-block"></span>
                  {widget.title}
                </h3>
                <ul className="flex flex-col list-none p-0 m-0">
                  {categories.slice(0, limitCat).map((cat: any) => (
                    <li key={cat.id} className="border-b border-slate-200/60 last:border-0">
                      <Link href={`/chuyen-muc/${cat.slug || cat.id}`} className="flex items-center justify-between py-3 text-slate-700 hover:text-gov-primary transition-colors group">
                        <div className="flex items-center gap-3">
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-gov-primary group-hover:scale-125 transition-all"></span>
                           <span className="font-medium text-[15px]">{cat.name}</span>
                        </div>
                        <span className="text-gov-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );

          // 2. Render Bài viết mới
          case 'recentArticlesWidget':
            const limitArt = widget.limit || 5;
            return (
              <div key={key} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-5 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gov-primary"></div>
                <h3 className="text-[1.1rem] font-bold text-gov-primary border-b-2 border-gov-primary/20 pb-3 mb-5 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-6 bg-gov-primary rounded-sm inline-block"></span>
                  {widget.title}
                </h3>
                <ul className="space-y-4 list-none p-0 m-0">
                  {latestArticles.slice(0, limitArt).map((post: any) => (
                    <li key={post.id} className="group border-b border-slate-200/60 last:border-0 pb-4 last:pb-0">
                      <Link href={`/bai-viet/${post.slug || post.id}`} className="block">
                        <h4 className="font-semibold text-slate-800 group-hover:text-gov-primary transition-colors line-clamp-3 text-sm leading-snug">
                          {post.title}
                        </h4>
                        <span className="text-[11px] text-gray-500 mt-2 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                          <Calendar size={12} />
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );

          // 3. Render TikTok Embed
          case 'tiktokWidget':
            if (!widget.channel) return null;
            return (
              <div key={key} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-5 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gov-primary"></div>
                {widget.title && (
                  <h3 className="text-[1.1rem] font-bold text-gov-primary border-b-2 border-gov-primary/20 pb-3 mb-5 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-6 bg-gov-primary rounded-sm inline-block"></span>
                    {widget.title}
                  </h3>
                )}
                <TikTokSidebarSlot
                  handle={widget.channel.tiktokHandle}
                  channelName={widget.channel.name}
                  channelUrl={widget.channel.channelUrl}
                  avatarUrl={widget.channel.avatar?.url}
                />
              </div>
            );

          // 4. Render Facebook Page Plugin
          case 'facebookWidget':
            const fbUrl = widget.pageUrl || 'https://www.facebook.com/cdcdanang';
            const fbHeight = widget.height || 350;
            const iframeSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(fbUrl)}&tabs=timeline&width=340&height=${fbHeight}&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;
            return (
              <div key={key} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-5 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gov-primary"></div>
                {widget.title && (
                  <h3 className="text-[1.1rem] font-bold text-gov-primary border-b-2 border-gov-primary/20 pb-3 mb-5 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-6 bg-gov-primary rounded-sm inline-block"></span>
                    {widget.title}
                  </h3>
                )}
                <div className="w-full overflow-hidden flex justify-center">
                  <iframe
                    src={iframeSrc}
                    width="100%"
                    height={fbHeight}
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  ></iframe>
                </div>
              </div>
            );

          // 5. Render Banner Quảng cáo
          case 'bannerWidget':
            return (
              <div key={key} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-5 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gov-primary"></div>
                {widget.title && (
                  <h3 className="text-[1.1rem] font-bold text-gov-primary border-b-2 border-gov-primary/20 pb-3 mb-5 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-6 bg-gov-primary rounded-sm inline-block"></span>
                    {widget.title}
                  </h3>
                )}
                <Link 
                  href={widget.linkUrl || '#'} 
                  target={widget.openInNewTab ? '_blank' : '_self'}
                  className="block hover:opacity-95 transition-opacity"
                >
                  <img 
                    src={widget.image?.url} 
                    alt={widget.title || "Banner"} 
                    className="rounded-lg max-w-full h-auto mx-auto shadow-sm"
                    width={320}
                    height={200}
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
              </div>
            );

          // 6. Render HTML Tùy chỉnh (Dành cho mã nhúng bên thứ 3)
          case 'customHtmlWidget':
            return (
              <div key={key} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-5 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gov-primary"></div>
                {widget.title && (
                  <h3 className="text-[1.1rem] font-bold text-gov-primary border-b-2 border-gov-primary/20 pb-3 mb-5 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-6 bg-gov-primary rounded-sm inline-block"></span>
                    {widget.title}
                  </h3>
                )}
                <div dangerouslySetInnerHTML={{ __html: widget.htmlContent }} />
              </div>
            );

          default:
            return null;
        }
      })}
    </aside>
  );
}
