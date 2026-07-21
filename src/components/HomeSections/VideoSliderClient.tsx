'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export default function VideoSliderClient({ children }: { children: React.ReactNode }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', slidesToScroll: 1 },
    [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );
  
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative group/vidslider">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2">
          {children}
        </div>
      </div>
      
      {/* Nút Prev */}
      <button
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
        aria-label="Video trước"
        className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-xl border border-white/50 flex items-center justify-center text-[var(--primary)] transition-all z-10 ${
          !prevBtnEnabled ? 'opacity-0 cursor-default' : 'opacity-0 group-hover/vidslider:opacity-100 hover:scale-110 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Nút Next */}
      <button
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
        aria-label="Video sau"
        className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-xl border border-white/50 flex items-center justify-center text-[var(--primary)] transition-all z-10 ${
          !nextBtnEnabled ? 'opacity-0 cursor-default' : 'opacity-0 group-hover/vidslider:opacity-100 hover:scale-110 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
