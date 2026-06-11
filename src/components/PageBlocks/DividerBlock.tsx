import React from 'react';

interface Props {
  style?: 'line' | 'gradient' | 'space';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function DividerBlock({ style = 'line', size = 'md' }: Props) {
  const sizeClass = { sm: 'my-2', md: 'my-4', lg: 'my-8', xl: 'my-16' }[size];

  if (style === 'space') return <div className={sizeClass} aria-hidden />;

  if (style === 'gradient') {
    return (
      <div className={sizeClass}>
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent" />
      </div>
    );
  }

  return (
    <div className={sizeClass}>
      <hr className="border-gray-200" />
    </div>
  );
}
