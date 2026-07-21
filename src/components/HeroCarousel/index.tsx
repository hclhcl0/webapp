import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { HeroCarouselClient } from './HeroCarouselClient';
import { WarningVideosClient } from './WarningVideosClient';
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
    const { docs } = await payload.find({
      collection: 'videos',
      sort: '-publishedDate',
      limit: 6,
      depth: 1,
    });
    return docs;
  } catch (error) {
    console.error("Error fetching warning videos:", error);
    return [];
  }
}

async function getSliderSettings() {
  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: 'site-settings' });
    const bannerConfig = (settings as any)?.banner || {};
    return {
      size: bannerConfig.heroSliderSize || 'medium',
      customHeight: bannerConfig.heroSliderCustomHeight || 500,
      effect: bannerConfig.heroSliderEffect || 'slide',
      autoplay: bannerConfig.heroSliderAutoplay !== false, // default true
      autoplayDelay: bannerConfig.heroSliderAutoplayDelay || 5000
    };
  } catch (error) {
    return {
      size: 'medium',
      customHeight: 500,
      effect: 'slide',
      autoplay: true,
      autoplayDelay: 5000
    };
  }
}

export const HeroCarousel = async () => {
  const banners = await getBanners();
  const settings = await getSliderSettings();
  let warningVideos = (settings as any)?.warningSection?.videos;
  if (!warningVideos || warningVideos.length === 0) {
    warningVideos = await getWarningVideos();
  }

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
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 lg:gap-3">
            {/* Cột trái: Slider Banner chính */}
            <div className="lg:col-span-7 xl:col-span-7 aspect-[2/1] md:aspect-[2.5/1] h-auto w-full rounded-xl overflow-hidden">
              <HeroCarouselClient 
                banners={banners} 
                globalSize={settings.size} 
                globalCustomHeight={settings.customHeight} 
                globalEffect={settings.effect} 
                globalAutoplay={settings.autoplay} 
                globalAutoplayDelay={settings.autoplayDelay} 
              />
            </div>

            {/* Cột phải: Cảnh báo quan trọng */}
            {warningVideos && warningVideos.length > 0 && (
              <div className="lg:col-span-3 xl:col-span-3 flex flex-col bg-transparent overflow-hidden h-auto">
                <div className="px-0 py-1.5 flex items-center gap-1.5 mb-1 flex-shrink-0">
                  <span className="text-lg">
                    {/* Nếu settings có icon thì dùng, nếu không thì dùng mặc định 🔥 */}
                    {settings?.warningSection?.icon ? (
                      // Check nếu icon là chuỗi emoji (độ dài ngắn) thì hiển thị text, nếu là link ảnh thì dùng thẻ img
                      settings.warningSection.icon.startsWith('http') || settings.warningSection.icon.startsWith('/') ? (
                        <img src={settings.warningSection.icon} alt="Warning Icon" className="w-5 h-5 object-contain" />
                      ) : (
                        settings.warningSection.icon
                      )
                    ) : (
                      '🔥'
                    )}
                  </span>
                  <h3 className="font-bold text-orange-600 uppercase tracking-tight text-[13px]">
                    {settings?.warningSection?.title || 'Cảnh báo quan trọng'}
                  </h3>
                </div>
                <div className="p-0 flex-1 h-auto lg:h-full w-full flex flex-col min-h-0">
                  <WarningVideosClient videos={warningVideos} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
