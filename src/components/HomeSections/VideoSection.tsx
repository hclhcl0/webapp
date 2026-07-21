import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { VideoCardPopup } from './VideoCardPopup';
import VideoSliderClient from './VideoSliderClient';

interface VideoSectionProps {
  title?: string;
  sourceType?: 'auto' | 'manual';
  channels?: { channel: string | { id: string } }[];
  manualVideos?: any[];
  limit?: number;
  layout?: 'grid' | 'featured';
}

async function getVideos(channelIds: string[], limit: number) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'videos',
      where: { channel: { in: channelIds } },
      sort: '-publishedDate',
      limit,
      depth: 1,
    });
    return docs;
  } catch {
    return [];
  }
}

export async function VideoSection({ 
  title = 'VIDEO NỔI BẬT', 
  sourceType = 'auto',
  channels, 
  manualVideos,
  limit = 4, 
  layout = 'grid' 
}: VideoSectionProps) {
  let videos: any[] = [];

  if (sourceType === 'manual') {
    if (!manualVideos || manualVideos.length === 0) return null;
    
    // Kiểm tra xem manualVideos đã được populate (có object) hay mới chỉ là mảng ID
    const isPopulated = typeof manualVideos[0] === 'object';
    if (isPopulated) {
      videos = manualVideos;
    } else {
      const payload = await getPayload({ config: configPromise });
      const { docs } = await payload.find({
        collection: 'videos',
        where: { id: { in: manualVideos } },
        depth: 1,
      });
      // Giữ nguyên thứ tự video đã được chọn
      videos = manualVideos.map(id => docs.find(d => d.id === id)).filter(Boolean);
    }
  } else {
    if (!channels || !Array.isArray(channels) || channels.length === 0) return null;

    const channelIds = channels
      .map(c => typeof c.channel === 'object' ? c.channel.id : c.channel)
      .filter(Boolean);

    if (channelIds.length === 0) return null;

    videos = await getVideos(channelIds, limit);
  }

  if (!videos.length) return null;

  const sectionTitle = title || 'VIDEO NỔI BẬT';

  return (
    <section className="w-full py-2">
      <div className="container mx-auto px-4 max-w-7xl">
        <hr className="border-t-2 border-gray-200 mb-6 mt-2 shadow-sm" />
        <div className="global-section-header">
          <h2 className="global-section-title">
            {sectionTitle}
          </h2>
          <Link href="/video" className="text-[var(--primary)] hover:text-[var(--primary-dark)] text-[0.875rem] font-semibold hover:underline transition-colors">
            Xem tất cả &raquo;
          </Link>
        </div>

          {layout === 'featured' && videos.length > 1 ? (
            <div className="grid md:grid-cols-[2fr_1fr] gap-4 relative z-10">
              {/* Main video */}
              <VideoCardPopup video={videos[0]} videoList={videos} initialIndex={0} isFeatured={true} />

              {/* Side list */}
              <div className="flex flex-col gap-3">
                {videos.slice(1).map((video: any, i: number) => (
                  <VideoCardPopup key={video.id} video={video} videoList={videos} initialIndex={i + 1} />
                ))}
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              <VideoSliderClient>
                {videos.map((video: any, index: number) => (
                  <div 
                    key={video.id} 
                    className="flex-[0_0_85%] sm:flex-[0_0_calc(50%-0.5rem)] md:flex-[0_0_calc(33.333%-0.75rem)] lg:flex-[0_0_calc(25%-0.75rem)] min-w-0"
                  >
                    <VideoCardPopup video={video} videoList={videos} initialIndex={index} variant="vertical" />
                  </div>
                ))}
              </VideoSliderClient>
            </div>
        </div>
      </div>
    </section>
  );
}
