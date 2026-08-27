import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { HeroCarouselClient } from './HeroCarouselClient';
import { WarningVideosClient } from './WarningVideosClient';
import { WarningToggleWrapper } from './WarningToggleWrapper';
import styles from './HeroCarousel.module.css';
import { VideoCardPopup } from '../HomeSections/VideoCardPopup';

async function getBanners() {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'banners',
      where: {
        and: [
          { isActive: { equals: true } },
          { position: { equals: 'home_slider' } },
        ]
      },
      sort: 'order',
      depth: 1,
    });
    return docs;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

async function getWarningVideos() {
  try {
    const payload = await getPayload({ config: configPromise });
    let { docs } = await payload.find({
      collection: 'videos',
      where: {
        isWarning: {
          equals: true
        }
      },
      sort: '-publishedDate',
      limit: 6,
      depth: 2,
    });
    // Nếu chưa có video nào được tick là Video cảnh báo, tự động lấy video mới nhất
    if (!docs || docs.length === 0) {
      const res = await payload.find({
        collection: 'videos',
        sort: '-publishedDate',
        limit: 6,
        depth: 2,
      });
      docs = res.docs;
    }
    return docs;
  } catch (error) {
    console.error("Error fetching warning videos:", error);
    return [];
  }
}

async function getSliderSettings() {
  try {
    const payload = await getPayload({ config: configPromise });
    const bannerSettings: any = await payload.findGlobal({ slug: 'banner-settings' }).catch(() => null);
    const heroSlider = bannerSettings?.heroSlider;

    const videoWarningSettings: any = await payload.findGlobal({ 
      slug: 'video-warning-settings',
      depth: 2,
    }).catch(() => null);

    const settings = await payload.findGlobal({ slug: 'site-settings' });
    const bannerConfig = (settings as any)?.banner || {};
    const oldWarning = (settings as any)?.warningSection || {};

    const warningEnabled = videoWarningSettings?.isEnabled !== undefined 
      ? Boolean(videoWarningSettings.isEnabled) 
      : (oldWarning.isEnabled !== false);
    const warningTitle = videoWarningSettings?.title || oldWarning.title || 'Cảnh báo quan trọng';
    const warningIcon = videoWarningSettings?.icon || oldWarning.icon || '🔥';

    // Đảm bảo luôn lấy được đối tượng video đầy đủ (có videoUrl, thumbnail)
    let warningVideos: any[] = [];
    const rawVideos = (videoWarningSettings && Array.isArray(videoWarningSettings.videos))
      ? videoWarningSettings.videos
      : (oldWarning.videos || []);

    if (Array.isArray(rawVideos) && rawVideos.length > 0) {
      const ids = rawVideos
        .map((v: any) => (typeof v === 'object' && v !== null ? v.id : v))
        .filter(Boolean);

      if (ids.length > 0) {
        const { docs } = await payload.find({
          collection: 'videos',
          where: {
            id: { in: ids },
          },
          depth: 2,
          limit: ids.length,
        });
        warningVideos = ids.map((id: any) => docs.find((d: any) => String(d.id) === String(id))).filter(Boolean);
      }
    }

    return {
      size: heroSlider?.heroSliderSize || bannerConfig.heroSliderSize || 'medium',
      customHeight: heroSlider?.heroSliderCustomHeight || bannerConfig.heroSliderCustomHeight || 500,
      effect: heroSlider?.heroSliderEffect || bannerConfig.heroSliderEffect || 'slide',
      autoplay: (heroSlider?.heroSliderAutoplay ?? bannerConfig.heroSliderAutoplay) !== false,
      autoplayDelay: heroSlider?.heroSliderAutoplayDelay || bannerConfig.heroSliderAutoplayDelay || 5000,
      warningEnabled,
      warningTitle,
      warningIcon,
      warningVideos,
    };
  } catch (error) {
    return {
      size: 'medium',
      customHeight: 500,
      effect: 'slide',
      autoplay: true,
      autoplayDelay: 5000,
      warningEnabled: true,
      warningTitle: 'Cảnh báo quan trọng',
      warningIcon: '🔥',
      warningVideos: [],
    };
  }
}

export const HeroCarousel = async () => {
  const banners = await getBanners();
  const settings = await getSliderSettings();

  // Lấy danh sách video: ưu tiên từ CMS settings, fallback auto-fetch
  let warningVideos = settings.warningVideos;
  if (!warningVideos || warningVideos.length === 0) {
    warningVideos = await getWarningVideos();
  }
  const showWarning = settings.warningEnabled && warningVideos && warningVideos.length > 0;

  if (!banners || banners.length === 0) {
    return (
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.banner}>
            <a href="#">
                <img src="https://via.placeholder.com/1200x500?text=Banner" alt="Default Banner" />
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-4 bg-gray-50/50">
      <div className="container mx-auto px-4">
        {/* Khung tổng bao quanh cả banner và cảnh báo */}
        <div className="p-1 bg-white/70 border border-gray-200/50 rounded-2xl backdrop-blur-sm shadow-sm">
          {showWarning ? (
            <WarningToggleWrapper
              title={settings.warningTitle}
              icon={
                settings.warningIcon.startsWith('http') || settings.warningIcon.startsWith('/') ? (
                  <img src={settings.warningIcon} alt="Warning Icon" className="w-5 h-5 object-contain" />
                ) : (
                  settings.warningIcon
                )
              }
              bannerContent={
                <HeroCarouselClient 
                  banners={banners} 
                  globalSize={settings.size} 
                  globalCustomHeight={settings.customHeight} 
                  globalEffect={settings.effect} 
                  globalAutoplay={settings.autoplay} 
                  globalAutoplayDelay={settings.autoplayDelay} 
                />
              }
              warningContent={
                <WarningVideosClient videos={warningVideos} />
              }
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 lg:gap-3">
              <div className="lg:col-span-10 xl:col-span-10 aspect-[2/1] md:aspect-[2.5/1] h-auto w-full rounded-xl overflow-hidden">
                <HeroCarouselClient 
                  banners={banners} 
                  globalSize={settings.size} 
                  globalCustomHeight={settings.customHeight} 
                  globalEffect={settings.effect} 
                  globalAutoplay={settings.autoplay} 
                  globalAutoplayDelay={settings.autoplayDelay} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
