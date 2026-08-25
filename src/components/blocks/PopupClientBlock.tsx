'use client';
import React, { useState, useEffect } from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';

interface PopupClientBlockProps {
  data: {
    buttonText?: string;
    buttonStyle?: 'primary' | 'danger' | 'warning' | 'success' | 'outline' | 'card';
    buttonIcon?: string;
    modalSize?: 'md' | 'lg' | 'xl';
    modalTitle?: string;
    modalSubtitle?: string;
    modalContent?: any;
    showCloseButton?: boolean;
    closeButtonText?: string;
  };
  converters?: any;
}

export default function PopupClientBlock({ data, converters }: PopupClientBlockProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const sizeClasses = {
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }[data.modalSize || 'lg'];

  const buttonStyleClasses = {
    primary: 'bg-gov-primary hover:bg-sky-700 text-white shadow-sm border border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm border border-transparent',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border border-transparent',
    outline: 'bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 dark:bg-zinc-800 dark:text-gray-100 dark:border-zinc-700',
    card: 'w-full bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200 py-3.5 px-5 rounded-xl text-left justify-between',
  }[data.buttonStyle || 'primary'];


  return (
    <div className="my-6 not-prose">
      {data.buttonStyle === 'card' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-3 ${buttonStyleClasses} font-semibold transition-all duration-150 cursor-pointer group shadow-sm hover:shadow`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{data.buttonIcon || '🔍'}</span>
            <div className="text-left">
              <div className="text-sm font-bold tracking-wide">{data.buttonText || 'Nhấp để xem chi tiết'}</div>
              {data.modalSubtitle && <div className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-0.5">{data.modalSubtitle}</div>}
            </div>
          </div>
          <span className="text-xs bg-white dark:bg-blue-900 border border-blue-300 dark:border-blue-700 font-medium px-3 py-1.5 rounded-lg text-blue-700 dark:text-blue-200 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            Mở cửa sổ ↗
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150 cursor-pointer active:scale-95 ${buttonStyleClasses}`}
        >
          <span className="text-lg leading-none">{data.buttonIcon || '🔍'}</span>
          <span>{data.buttonText || 'Nhấp để xem chi tiết'}</span>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className={`relative w-full ${sizeClasses} max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/60">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <span className="text-2xl flex-shrink-0">{data.buttonIcon || 'ℹ️'}</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate uppercase tracking-wide">
                    {data.modalTitle || 'THÔNG TIN CHI TIẾT'}
                  </h3>
                  {data.modalSubtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{data.modalSubtitle}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/80 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors flex-shrink-0 cursor-pointer text-lg font-bold"
                title="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 prose prose-blue dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base">
              {data.modalContent && (
                <RichText data={data.modalContent} converters={converters} />
              )}
            </div>

            {/* Footer */}
            {data.showCloseButton !== false && (
              <div className="px-6 py-3.5 bg-gray-50/80 dark:bg-zinc-800/60 border-t border-gray-100 dark:border-zinc-800 flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-100 font-semibold text-sm transition-colors cursor-pointer"
                >
                  {data.closeButtonText || 'Đóng lại'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
