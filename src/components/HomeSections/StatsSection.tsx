'use client';

import React, { useEffect, useRef, useState } from 'react';

interface StatItem {
  icon: string;
  value: string;
  label: string;
  suffix?: string;
}

interface StatsSectionProps {
  title?: string;
  backgroundColor?: 'primary' | 'light' | 'gray';
  stats: StatItem[];
}

// Animated number counter hook
function useCountUp(target: string, duration = 2000, isVisible: boolean) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isVisible) return;

    // Extract numeric value and format parts
    const numericMatch = target.replace(/,/g, '').match(/^([\d.]+)/);
    if (!numericMatch) {
      setDisplay(target);
      return;
    }

    const endNum = parseFloat(numericMatch[1]);
    const prefix = target.slice(0, target.search(/[\d]/));
    const suffix = target.slice(target.search(/[\d,.]/) + numericMatch[0].length);
    const isFloat = endNum % 1 !== 0;

    const start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * endNum;

      const formatted = isFloat
        ? current.toFixed(1)
        : Math.floor(current).toLocaleString('vi-VN');

      setDisplay(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [target, duration, isVisible]);

  return display;
}

function StatCard({ stat, isVisible }: { stat: StatItem; isVisible: boolean }) {
  const displayValue = useCountUp(stat.value, 2000, isVisible);

  return (
    <div className="text-center flex flex-col items-center gap-2">
      <span className="text-4xl">{stat.icon}</span>
      <div className="text-3xl md:text-4xl font-extrabold">
        {displayValue}{stat.suffix && <span className="text-xl ml-1">{stat.suffix}</span>}
      </div>
      <p className="text-sm md:text-base font-medium opacity-90">{stat.label}</p>
    </div>
  );
}

export function StatsSection({ title, backgroundColor = 'primary', stats }: StatsSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const bgStyles: Record<string, string> = {
    primary: 'bg-[var(--primary)] text-white',
    light: 'bg-white text-[var(--text-dark)] border border-[var(--border)]',
    gray: 'bg-gray-100 text-[var(--text-dark)]',
  };

  return (
    <section ref={ref} className={`w-full py-12 my-2 ${bgStyles[backgroundColor]}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        {title && (
          <div className="global-section-header">
            <h2 className={`global-section-title ${backgroundColor === 'primary' ? 'global-section-title-white' : ''}`}>
              {title}
            </h2>
          </div>
        )}
        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
          }}
        >
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
