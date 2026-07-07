"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

function getYoutubeId(url: string) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

export function VideoCardPopup({ video, isFeatured = false }: { video: any, isFeatured?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const yId = getYoutubeId(video.videoUrl);
  const thumbUrl = video.thumbnail?.url || (yId ? `https://img.youtube.com/vi/${yId}/${isFeatured ? 'maxresdefault' : 'hqdefault'}.jpg` : '');

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
      >
        <div className="relative aspect-video overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={video.title || 'Video CDC Đà Nẵng'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              width={480}
              height={270}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="text-gray-400">Không có ảnh thu nhỏ</span>
          )}
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
            <div className={`rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 border border-white/30 ${isFeatured ? 'w-20 h-20' : 'w-14 h-14'}`}>
              <svg viewBox="0 0 24 24" fill="white" className={`${isFeatured ? 'w-8 h-8 ml-1.5' : 'w-6 h-6 ml-1'} drop-shadow-md`}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        </div>
        <div className={isFeatured ? "p-4" : "p-3 flex-1 flex flex-col"}>
          <h4 className={`${isFeatured ? 'font-bold text-base' : 'text-sm font-semibold'} text-gray-800 line-clamp-2 group-hover:text-[var(--primary)] transition-colors leading-tight`}>
            {video.title}
          </h4>
          {!isFeatured && video.publishedDate && (
            <p className="text-xs text-gray-400 mt-auto pt-2">
              {new Date(video.publishedDate).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      </div>

      {mounted && isOpen && yId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black text-white rounded-full p-2 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative aspect-video w-full">
              <iframe
                className="w-full h-full absolute inset-0"
                src={`https://www.youtube.com/embed/${yId}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {mounted && isOpen && !yId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)}></div>
          <div className="relative bg-white p-6 rounded-lg z-10 max-w-md w-full text-center">
            <p className="text-gray-800 mb-4">Video này cần được mở ở trang gốc.</p>
            <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-medium inline-block">
              Mở video
            </a>
            <button onClick={() => setIsOpen(false)} className="ml-3 text-gray-500 hover:text-gray-800 font-medium">Đóng</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
