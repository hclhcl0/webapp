// @ts-nocheck
import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
  level?: 'h2' | 'h3';
  alignment?: 'left' | 'center' | 'right';
  style?: 'underline' | 'divider' | 'filled' | 'plain';
}

export function SectionTitleBlock({
  title,
  subtitle,
  level = 'h2',
  alignment = 'left',
  style = 'underline',
}: Props) {
  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }[alignment];

  const Tag = level as keyof JSX.IntrinsicElements;

  return (
    <div className={`my-8 ${alignClass}`}>
      {style === 'filled' ? (
        <div className="bg-[var(--primary)] text-white px-6 py-4 rounded-lg inline-block">
          <Tag className="text-2xl md:text-3xl font-bold m-0 text-white">{title}</Tag>
        </div>
      ) : style === 'divider' ? (
        <div className={`flex items-center gap-4 ${alignment === 'center' ? 'justify-center' : ''}`}>
          <div className="flex-1 h-px bg-gray-200" />
          <Tag className="text-2xl md:text-3xl font-bold text-[var(--primary)] whitespace-nowrap m-0">{title}</Tag>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      ) : (
        <div>
          <Tag
            className={`text-2xl md:text-3xl font-bold text-[var(--primary)] m-0 ${
              style === 'underline'
                ? 'pb-3 border-b-4 border-[var(--primary)] inline-block'
                : ''
            }`}
          >
            {title}
          </Tag>
        </div>
      )}
      {subtitle && (
        <p className="mt-3 text-gray-500 text-base md:text-lg">{subtitle}</p>
      )}
    </div>
  );
}
