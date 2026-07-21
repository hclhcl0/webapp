import React from 'react';

interface QuickLink {
  icon: string;
  label: string;
  url: string;
  openInNewTab?: boolean;
  color?: 'primary' | 'secondary' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
}

interface QuickLinksSectionProps {
  title?: string;
  links: QuickLink[];
}

const colorMap: Record<string, { bg: string; text: string; hover: string; border: string }> = {
  primary:   { bg: 'bg-[var(--primary-50)]',   text: 'text-[var(--primary)]',   hover: 'hover:bg-[var(--primary)] hover:text-white',   border: 'border-[var(--primary-100)]' },
  secondary: { bg: 'bg-blue-50',                 text: 'text-blue-600',            hover: 'hover:bg-blue-600 hover:text-white',           border: 'border-blue-100' },
  green:     { bg: 'bg-green-50',                text: 'text-green-600',           hover: 'hover:bg-green-600 hover:text-white',          border: 'border-green-100' },
  orange:    { bg: 'bg-orange-50',               text: 'text-orange-600',          hover: 'hover:bg-orange-600 hover:text-white',         border: 'border-orange-100' },
  red:       { bg: 'bg-red-50',                  text: 'text-red-600',             hover: 'hover:bg-red-600 hover:text-white',            border: 'border-red-100' },
  purple:    { bg: 'bg-purple-50',               text: 'text-purple-600',          hover: 'hover:bg-purple-600 hover:text-white',         border: 'border-purple-100' },
  gray:      { bg: 'bg-gray-100',                text: 'text-gray-600',            hover: 'hover:bg-gray-600 hover:text-white',           border: 'border-gray-200' },
};

export function QuickLinksSection({ title = 'DỊCH VỤ TRỰC TUYẾN', links }: QuickLinksSectionProps) {
  if (!links?.length) return null;

  return (
    <section className="w-full py-4 bg-white border-y border-[var(--border)]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="p-4 sm:p-5 bg-white/70 border border-gray-200/50 rounded-2xl backdrop-blur-sm shadow-sm mb-6">
          {title && (
            <div className="global-section-header">
              <h2 className="global-section-title">
                {title}
              </h2>
            </div>
          )}
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(links.length, 6)}, 1fr)`,
            }}
          >
            {links.map((link, i) => {
              const colors = colorMap[link.color || 'primary'];
              return (
                <a
                  key={i}
                  href={link.url}
                  target={link.openInNewTab !== false ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 text-center group ${colors.bg} ${colors.text} ${colors.hover} ${colors.border}`}
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                    {link.icon}
                  </span>
                  <span className="text-xs md:text-sm font-semibold leading-tight">
                    {link.label}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
