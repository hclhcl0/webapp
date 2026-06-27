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
        <div className="flex gap-4 p-1">
          {children}
        </div>
      </div>
      
      {/* Nút Prev */}
      <button
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-[var(--primary)] transition-all z-10 ${
          !prevBtnEnabled ? 'opacity-0 cursor-default' : 'opacity-0 group-hover/vidslider:opacity-100 hover:scale-110 hover:bg-[var(--primary)] hover:text-white'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Nút Next */}
      <button
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-[var(--primary)] transition-all z-10 ${
          !nextBtnEnabled ? 'opacity-0 cursor-default' : 'opacity-0 group-hover/vidslider:opacity-100 hover:scale-110 hover:bg-[var(--primary)] hover:text-white'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
