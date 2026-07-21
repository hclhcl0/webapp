"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

function getYoutubeId(url: string) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&?]+)/);
  return match ? match[1] : null;
}

const TikTokVideoEmbed = ({ videoUrl, tId }: { videoUrl: string, tId: string }) => {
  return (
    <iframe
      className="w-full"
      src={`https://www.tiktok.com/player/v1/${tId}?music_info=1&description=1`}
      title="TikTok video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      style={{ aspectRatio: '9/16', minHeight: '500px' }}
    ></iframe>
  );
};

function getTiktokId(url: string) {
  if (!url) return null;
  const match = url.match(/tiktok\.com\/.*video\/(\d+)/);
  if (match) return match[1];
  return null;
}

export function VideoCardPopup({ 
  video, 
  videoList = [], 
  initialIndex = -1,
  isFeatured = false, 
  variant = 'horizontal' 
}: { 
  video: any, 
  videoList?: any[],
  initialIndex?: number,
  isFeatured?: boolean, 
  variant?: 'vertical' | 'horizontal' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = () => {
    setActiveIndex(initialIndex);
    setIsOpen(true);
  };

  const navigateVideo = (direction: number) => {
    setActiveIndex((prev) => {
      let next = prev + direction;
      if (next < 0) next = videoList.length - 1;
      if (next >= videoList.length) next = 0;
      return next;
    });
  };

  // Card values
  const yId = getYoutubeId(video.videoUrl);
  const tId = getTiktokId(video.videoUrl);
  const thumbUrl = video.thumbnail?.url || (yId ? `https://img.youtube.com/vi/${yId}/${variant === 'vertical' ? 'mqdefault' : 'maxresdefault'}.jpg` : '');

  // Modal values
  const activeVideo = (videoList.length > 0 && activeIndex >= 0) ? videoList[activeIndex] : video;
  const modalYId = getYoutubeId(activeVideo.videoUrl);
  const modalTId = getTiktokId(activeVideo.videoUrl);

  return (
    <>
      <div
        onClick={openModal}
        className={`group cursor-pointer overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col relative ${variant === 'vertical' ? 'rounded-2xl border-transparent aspect-[9/16] bg-gray-900' : 'bg-white rounded-xl border-gray-100'}`}
      >
        <div className={`relative flex items-center justify-center shrink-0 w-full ${variant === 'vertical' ? 'h-full absolute inset-0' : 'aspect-video overflow-hidden bg-gray-100'}`}>
          {thumbUrl ? (
            <Image
              src={thumbUrl}
              alt={video.title || 'Video CDC Đà Nẵng'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              width={variant === 'vertical' ? 300 : 480}
              height={variant === 'vertical' ? 533 : 270}
              loading="lazy"
            />
          ) : (
            <span className="text-gray-400">Không có ảnh thu nhỏ</span>
          )}
          
          {/* Vertical Title Gradient Overlay */}
          {variant === 'vertical' && (
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
          )}

          {/* Play button overlay */}
          {variant === 'vertical' ? (
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
              <div className="rounded-lg bg-white/30 backdrop-blur-sm p-1.5 shadow-sm">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 drop-shadow-sm">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300 z-20">
              <div className={`rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 border border-white/30 ${isFeatured ? 'w-20 h-20' : 'w-14 h-14'}`}>
                <svg viewBox="0 0 24 24" fill="white" className={`${isFeatured ? 'w-8 h-8 ml-1.5' : 'w-6 h-6 ml-1'} drop-shadow-md`}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
          )}
        </div>
        <div className={`relative z-20 ${variant === 'vertical' ? 'p-4 mt-auto' : (isFeatured ? "p-4" : "p-3 flex-1 flex flex-col")}`}>
          <h4 className={`${variant === 'vertical' ? 'font-bold text-white text-[15px]' : (isFeatured ? 'font-bold text-base' : 'text-sm font-semibold')} line-clamp-3 group-hover:text-[var(--primary)] transition-colors leading-tight ${variant !== 'vertical' && 'text-gray-800'}`}>
            {video.title}
          </h4>
          {variant !== 'vertical' && !isFeatured && video.publishedDate && (
            <p suppressHydrationWarning className="text-xs text-gray-400 mt-auto pt-2">
              {new Date(video.publishedDate).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      </div>

      {mounted && isOpen && modalYId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)}></div>
          {videoList.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[1000] bg-black/50 hover:bg-black text-white rounded-full p-2 md:p-3 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigateVideo(-1); }}
                aria-label="Video trước"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] bg-black/50 hover:bg-black text-white rounded-full p-2 md:p-3 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigateVideo(1); }}
                aria-label="Video tiếp theo"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          <div className="relative w-full max-w-5xl bg-black rounded-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <div className="bg-black text-white p-3 flex justify-between items-center">
              <h3 className="font-medium truncate pr-8">{activeVideo.title || 'YouTube Video'}</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black text-white rounded-full p-2 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full aspect-video">
              <iframe
                className="w-full h-full absolute inset-0"
                src={`https://www.youtube.com/embed/${modalYId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
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

      {mounted && isOpen && modalTId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)}></div>
          {videoList.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[1000] bg-black/50 hover:bg-black text-white rounded-full p-2 md:p-3 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigateVideo(-1); }}
                aria-label="Video trước"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] bg-black/50 hover:bg-black text-white rounded-full p-2 md:p-3 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigateVideo(1); }}
                aria-label="Video tiếp theo"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          <div className="relative w-full max-w-[400px] rounded-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-0 right-0 z-20 bg-black/60 hover:bg-black text-white rounded-full p-2 transition-colors cursor-pointer m-2"
            >
              <X className="w-6 h-6" />
            </button>
            <TikTokVideoEmbed videoUrl={activeVideo.videoUrl} tId={modalTId} />
          </div>
        </div>,
        document.body
      )}
      
      {mounted && isOpen && !modalYId && !modalTId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)}></div>
          {videoList.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[1000] bg-black/50 hover:bg-black text-white rounded-full p-2 md:p-3 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigateVideo(-1); }}
                aria-label="Video trước"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] bg-black/50 hover:bg-black text-white rounded-full p-2 md:p-3 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigateVideo(1); }}
                aria-label="Video tiếp theo"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          <div className="relative bg-white p-6 rounded-lg z-10 max-w-md w-full text-center">
            <p className="text-gray-800 mb-4">Video này cần được mở ở trang gốc.</p>
            <a href={activeVideo.videoUrl} target="_blank" rel="noopener noreferrer" className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-medium inline-block">
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
