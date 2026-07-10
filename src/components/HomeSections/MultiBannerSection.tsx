import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BannerItem {
  id: string;
  image: {
    url: string;
    alt?: string;
  };
  linkUrl?: string;
  openInNewTab?: boolean;
}

interface MultiBannerSectionProps {
  title?: string;
  columns?: number;
  banners: BannerItem[];
}

// Helper: kiểm tra URL nội bộ
function isInternalUrl(url: string) {
  if (!url) return false;
  return url.startsWith('/') || url.startsWith('./') || url.includes('ecdc.vnos.org');
}

export function MultiBannerSection({ title, columns = 4, banners }: MultiBannerSectionProps) {
  if (!banners || banners.length === 0) return null;

  // Grid styling based on columns prop
  let gridColsClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'; // default to 4 on large screens
  
  if (columns === 2) gridColsClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
  else if (columns === 3) gridColsClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3';
  else if (columns === 4) gridColsClass = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-4';
  else if (columns === 5) gridColsClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
  else if (columns === 6) gridColsClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';

  return (
    <section className="py-8 bg-white w-full">
      <div className="w-full">
        {title && (
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 relative inline-block">
              {title}
              <span className="absolute bottom-[-8px] left-0 w-1/2 h-1 bg-[var(--primary-color)]"></span>
            </h2>
          </div>
        )}

        <div className={`grid gap-2 md:gap-4 px-2 md:px-4 ${gridColsClass}`}>
          {banners.map((item, index) => {
            const imageUrl = item.image?.url;
            if (!imageUrl) return null;

            const target = item.openInNewTab ? '_blank' : '_self';
            
            const content = (
              <div className="relative w-full overflow-hidden rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 group" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={imageUrl}
                  alt={item.image?.alt || `Banner ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes={`(max-width: 768px) 50vw, (max-width: 1024px) 33vw, ${Math.floor(100 / columns)}vw`}
                  unoptimized={!isInternalUrl(imageUrl)}
                />
              </div>
            );

            if (item.linkUrl) {
              // Internal link
              if (isInternalUrl(item.linkUrl) && !item.openInNewTab) {
                return (
                  <Link key={item.id || index} href={item.linkUrl} className="block w-full h-full">
                    {content}
                  </Link>
                );
              }
              // External link
              return (
                <a key={item.id || index} href={item.linkUrl} target={target} rel={target === '_blank' ? "noopener noreferrer" : undefined} className="block w-full h-full">
                  {content}
                </a>
              );
            }

            return (
              <div key={item.id || index} className="block w-full h-full">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
