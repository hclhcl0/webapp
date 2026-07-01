'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { getJsxConverters } from '@/components/LexicalConverters';

export interface SitePopupProps {
  popupConfig?: {
    enabled?: boolean | null;
    title?: string | null;
    image?: any;
    content?: any;
    linkUrl?: string | null;
    delaySeconds?: number | null;
    showOnce?: boolean | null;
  };
}

export function SitePopup({ popupConfig }: SitePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false); // For fade-out animation

  useEffect(() => {
    // If not enabled or no config, do nothing
    if (!popupConfig?.enabled) return;

    // Check localStorage if showOnce is true
    if (popupConfig.showOnce) {
      const closed = localStorage.getItem('cdc_popup_closed');
      if (closed === 'true') {
        return;
      }
    }

    // Set delay to show popup
    const delay = (popupConfig.delaySeconds || 0) * 1000;
    const timer = setTimeout(() => {
      setShouldRender(true);
      // Give a tiny delay for the DOM to render before applying opacity 1
      setTimeout(() => setIsOpen(true), 10);
    }, delay);

    return () => clearTimeout(timer);
  }, [popupConfig]);

  const handleClose = () => {
    setIsOpen(false);
    
    // Remember that user closed it
    if (popupConfig?.showOnce) {
      localStorage.setItem('cdc_popup_closed', 'true');
    }

    // Wait for fade-out animation to finish before unmounting
    setTimeout(() => {
      setShouldRender(false);
    }, 300);
  };

  if (!shouldRender || !popupConfig) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal Dialog */}
      <div 
        className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
      >
        {/* Close Button (Absolute positioned) */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Đóng thông báo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Banner */}
        {popupConfig.image?.url && (
          <div className="relative w-full h-48 sm:h-64 md:h-72 bg-gray-100 flex-shrink-0">
            <Image
              src={popupConfig.image.url}
              alt={popupConfig.image.alt || popupConfig.title || 'Thông báo popup'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 42rem"
              priority
            />
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 sm:p-8 flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
          {popupConfig.title && (
            <h2 id="popup-title" className="text-xl sm:text-2xl font-bold text-[var(--primary)] mb-4 uppercase text-center">
              {popupConfig.title}
            </h2>
          )}

          {popupConfig.content && (
            <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
              <RichText 
                data={popupConfig.content} 
                converters={getJsxConverters('Hình minh họa Popup')} 
              />
            </div>
          )}

          {popupConfig.linkUrl && (
            <div className="mt-8 flex justify-center">
              <Link 
                href={popupConfig.linkUrl}
                className="inline-block px-8 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-medium rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-center w-full sm:w-auto"
                onClick={handleClose}
              >
                Tìm hiểu thêm
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
