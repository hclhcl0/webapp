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

  // Tính toán tỷ lệ khung hình từ ảnh đầu tiên để không bị cắt ảnh
  const firstBanner = banners?.[0];
  const firstImg = firstBanner?.image;
  const firstMobileImg = firstBanner?.mobileImage || firstImg;
  
  const desktopRatio = firstImg?.width && firstImg?.height ? `${firstImg.width}/${firstImg.height}` : '21/9';
  const mobileRatio = firstMobileImg?.width && firstMobileImg?.height ? `${firstMobileImg.width}/${firstMobileImg.height}` : '4/3';

  // Override fixed heights, use auto height with dynamic aspect ratio
  const sizeClass = '';
  const heightStyle = { 
    height: '100%',
    '--desktop-ratio': desktopRatio,
    '--mobile-ratio': mobileRatio,
  } as React.CSSProperties;

  const isFade = globalEffect === 'fade';
  const isZoom = globalEffect === 'zoom';
  const isFlip = globalEffect === 'flip';

  return (
    <section className={`${styles.heroSection} h-full`}>
      <div className="w-full h-full">
        {/* Wrapper ngoài cùng có position:relative để các nút absolute định vị theo */}
        <div style={{ position: 'relative', height: '100%' }}>
          {/* Khung carousel — overflow:hidden để ảnh không bị tràn */}
          <div
            className={`${styles.embla} ${sizeClass} ${isFade || isZoom || isFlip ? styles.effectWrapper : ''} h-full`}
            ref={emblaRef}
            style={heightStyle}
          >
            <div className={`${styles.embla__container} ${isFade || isZoom || isFlip ? styles.effectContainer : ''} h-full`}>
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
                    className={`${styles.embla__slide} ${slideEffectClass} h-full`}
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

          {/* Nút Prev — style giống thiết kế Long Châu (tròn trắng, icon tối) */}
          <button 
            onClick={scrollPrev}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              color: '#333',
              backgroundColor: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>

          {/* Nút Next — style giống thiết kế Long Châu (tròn trắng, icon tối) */}
          <button 
            onClick={scrollNext}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              color: '#333',
              backgroundColor: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
            aria-label="Ảnh sau"
          >
            <ChevronRight size={24} strokeWidth={2.5} />
          </button>

          {/* Dấu chấm phân trang (Pagination Dots) ở đáy */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '0',
            right: '0',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 20,
          }}>
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi && emblaApi.scrollTo(index)}
                style={{
                  width: index === selectedIndex ? '20px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: index === selectedIndex ? '#192b49' : 'rgba(255,255,255,0.8)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
                aria-label={`Chuyển đến ảnh ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
