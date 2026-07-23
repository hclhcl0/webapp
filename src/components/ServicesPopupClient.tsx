'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';

export interface ServiceItem {
  id?: string;
  icon?: string;
  iconImage?: { url: string; alt?: string } | null;
  title: string;
  description?: string;
  linkUrl?: string;
}

export function ServicesPopupClient({
  title,
  subtitle,
  mascotImage,
  headerColor,
  items,
  delaySeconds,
  showOnce,
  storageKey,
}: {
  title: string;
  subtitle?: string;
  mascotImage?: { url: string; alt?: string } | null;
  headerColor?: string;
  items: ServiceItem[];
  delaySeconds?: number;
  showOnce?: boolean;
  storageKey?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const key = storageKey || 'cdc_services_popup_closed';

  useEffect(() => {
    if (showOnce) {
      const closed = localStorage.getItem(key);
      if (closed === 'true') return;
    }

    const delay = (delaySeconds ?? 1) * 1000;
    const timer = setTimeout(() => {
      setShouldRender(true);
      setTimeout(() => setIsOpen(true), 10);
    }, delay);

    return () => clearTimeout(timer);
  }, [delaySeconds, showOnce, key]);

  const handleClose = () => {
    setIsOpen(false);
    if (showOnce) {
      localStorage.setItem(key, 'true');
    }
    setTimeout(() => setShouldRender(false), 300);
  };

  if (!shouldRender) return null;

  const bgColor = headerColor || '#00a99d';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={handleClose}
      />

      {/* Popup wrapper — positioned so mascot overflows top */}
      <div
        className={`relative z-10 w-full max-w-sm mx-4 mb-8 sm:mb-0 transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-6'
        }`}
      >
        {/* Mascot — absolute, centered, overflows the card top */}
        {mascotImage?.url && (
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-20 w-32 h-32 drop-shadow-xl pointer-events-none">
            <Image
              src={mascotImage.url}
              alt={mascotImage.alt || 'CDC Mascot'}
              fill
              className="object-contain"
              sizes="128px"
              priority
            />
          </div>
        )}

        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: '#f0fafa' }}
        >
          {/* Header banner */}
          <div
            className="pt-14 pb-4 px-6 text-center"
            style={{ background: bgColor }}
          >
            <h2 className="text-white font-bold text-lg leading-tight tracking-wide drop-shadow">
              {title}
            </h2>
            {subtitle && (
              <p className="text-white/80 text-xs mt-1">{subtitle}</p>
            )}
          </div>

          {/* Items list */}
          <div className="p-4 flex flex-col gap-2.5 max-h-[55vh] overflow-y-auto">
            {items.map((item, idx) => {
              const content = (
                <div
                  key={item.id || idx}
                  className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-white/80 group"
                >
                  {/* Icon */}
                  <div className="w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-teal-50 text-2xl">
                    {item.iconImage?.url ? (
                      <Image
                        src={item.iconImage.url}
                        alt={item.iconImage.alt || item.title}
                        width={40}
                        height={40}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <span>{item.icon || '🏥'}</span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-1">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow if has link */}
                  {item.linkUrl && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ background: bgColor }}
                    >
                      <ChevronRight size={14} className="text-white" />
                    </div>
                  )}
                </div>
              );

              return item.linkUrl ? (
                <Link key={item.id || idx} href={item.linkUrl} onClick={handleClose}>
                  {content}
                </Link>
              ) : (
                <div key={item.id || idx}>{content}</div>
              );
            })}
          </div>
        </div>

        {/* Close button — below the card, centered */}
        <div className="flex justify-center mt-5">
          <button
            onClick={handleClose}
            aria-label="Đóng"
            className="w-11 h-11 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
