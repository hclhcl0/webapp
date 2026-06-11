import React from 'react';
import Link from 'next/link';

interface BannerSectionProps {
  image: { url: string; alt?: string };
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  openInNewTab?: boolean;
  style?: 'fullwidth' | 'card';
}

export function BannerSection({ image, title, subtitle, linkUrl, openInNewTab, style = 'fullwidth' }: BannerSectionProps) {
  if (!image?.url) return null;

  const content = (
    <div className={`relative overflow-hidden ${style === 'card' ? 'rounded-2xl shadow-lg' : ''} w-full`}>
      <img
        src={image.url}
        alt={title || image.alt || ''}
        className="w-full h-auto object-cover block"
        style={{ maxHeight: style === 'fullwidth' ? '400px' : '280px', objectFit: 'cover', width: '100%' }}
      />
      {(title || subtitle) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          {title && (
            <h3 className="text-white font-bold text-xl md:text-2xl mb-1 drop-shadow">{title}</h3>
          )}
          {subtitle && (
            <p className="text-white/90 text-sm md:text-base drop-shadow">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );

  const wrapperClass = style === 'fullwidth'
    ? 'w-full my-2'
    : 'container mx-auto px-4 max-w-7xl my-6';

  if (linkUrl) {
    return (
      <div className={wrapperClass}>
        <a
          href={linkUrl}
          target={openInNewTab ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="block hover:opacity-95 transition-opacity"
        >
          {content}
        </a>
      </div>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
