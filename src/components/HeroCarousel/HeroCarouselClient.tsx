"use client";

import React, { useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HeroCarousel.module.css';

interface Props {
  banners: any[];
  globalSize: string;
  globalCustomHeight: number;
  globalEffect: string;
  globalAutoplay: boolean;
  globalAutoplayDelay: number;
}

// Helper: kiểm tra URL nội bộ
function isInternalUrl(url: string) {
  if (!url) return false;
  return url.startsWith('/') || url.startsWith('./') || url.includes('ecdc.vnos.org');
}

export const HeroCarouselClient = ({ banners, globalSize, globalCustomHeight, globalEffect, globalAutoplay, globalAutoplayDelay }: Props) => {
  const plugins = React.useMemo(() => {
    return globalAutoplay === false ? [] : [Autoplay({ delay: globalAutoplayDelay || 5000, stopOnInteraction: false })];
  }, [globalAutoplay, globalAutoplayDelay]);

  const emblaOptions = React.useMemo(() => ({
    loop: true,
    duration: globalEffect === 'slide' ? 25 : 0
  }), [globalEffect]);

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  let sizeClass = '';
  let heightStyle: React.CSSProperties = {};

  if (globalSize === 'small') sizeClass = styles.sizeSmall;
  else if (globalSize === 'medium') sizeClass = styles.sizeMedium;
  else if (globalSize === 'large') sizeClass = styles.sizeLarge;
  else if (globalSize === 'custom' && globalCustomHeight) {
    heightStyle = { height: `${globalCustomHeight}px` };
  }

  const isFade = globalEffect === 'fade';
  const isZoom = globalEffect === 'zoom';
  const isFlip = globalEffect === 'flip';

  return (
    <section className={styles.heroSection}>
      <div className="container">
        {/* Wrapper ngoài cùng có position:relative để các nút absolute định vị theo */}
        <div style={{ position: 'relative' }}>
          {/* Khung carousel — overflow:hidden để ảnh không bị tràn */}
          <div
            className={`${styles.embla} ${sizeClass} ${isFade || isZoom || isFlip ? styles.effectWrapper : ''}`}
            ref={emblaRef}
            style={heightStyle}
          >
            <div className={`${styles.embla__container} ${isFade || isZoom || isFlip ? styles.effectContainer : ''}`}>
              {banners.map((banner, index) => {
                const imageUrl = banner.image?.url || 'https://via.placeholder.com/1200x500?text=Banner';
                const mobileUrl = banner.mobileImage?.url;
                const target = banner.openInNewTab ? '_blank' : '_self';
                const isActive = index === selectedIndex;

                let slideEffectClass = '';
                if (isFade) slideEffectClass = isActive ? styles.fadeActive : styles.fadeInactive;
                else if (isZoom) slideEffectClass = isActive ? styles.zoomActive : styles.zoomInactive;
                else if (isFlip) slideEffectClass = isActive ? styles.flipActive : styles.flipInactive;

                return (
                  <div
                    className={`${styles.embla__slide} ${slideEffectClass}`}
                    key={banner.id}
                    style={isFade || isZoom || isFlip ? { position: 'absolute', inset: 0, width: '100%' } : {}}
                  >
                    <a 
                      href={banner.link || '#'} 
                      className={styles.banner} 
                      target={target} 
                      rel={target === '_blank' ? "noopener noreferrer" : undefined}
                      style={{ display: 'block', width: '100%', height: '100%', cursor: banner.link ? 'pointer' : 'default' }}
                    >
                      <picture className="w-full h-full block" style={heightStyle}>
                        {mobileUrl && <source media="(max-width: 768px)" srcSet={mobileUrl} />}
                        {/* Phase 2 Fix: Sử dụng Image của Next.js để có WebP và sizes tối ưu */}
                        <Image
                          src={imageUrl}
                          alt={banner.title || `Banner CDC Đà Nẵng số ${index + 1}`}
                          className="w-full h-full object-cover"
                          style={heightStyle}
                          width={1200}
                          height={500}
                          sizes="100vw"
                          priority={index === 0}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          loading={index === 0 ? "eager" : "lazy"}
                          decoding={index === 0 ? "sync" : "async"}
                          quality={60}
                          unoptimized={!isInternalUrl(imageUrl)}
                        />
                      </picture>
                    </a>
                  </div>
                );

              })}
            </div>
          </div>

          {/* Nút Prev — absolute so với wrapper, đè lên trên ảnh bên TRÁI */}
          <button 
            onClick={scrollPrev}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              color: 'white',
              opacity: 0.65,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.95))',
              transition: 'opacity 0.2s',
              lineHeight: 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.65')}
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={44} strokeWidth={2.5} />
          </button>

          {/* Nút Next — absolute so với wrapper, đè lên trên ảnh bên PHẢI */}
          <button 
            onClick={scrollNext}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              color: 'white',
              opacity: 0.65,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.95))',
              transition: 'opacity 0.2s',
              lineHeight: 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.65')}
            aria-label="Ảnh sau"
          >
            <ChevronRight size={44} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
};
