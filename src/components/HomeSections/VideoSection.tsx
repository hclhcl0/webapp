import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { VideoCardPopup } from './VideoCardPopup';
import VideoSliderClient from './VideoSliderClient';

interface VideoSectionProps {
  title?: string;
  channel: { id: string } | string;
  limit?: number;
  layout?: 'grid' | 'featured';
}

async function getVideos(channelId: string, limit: number) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'videos',
      where: { channel: { equals: channelId } },
      sort: '-publishedDate',
      limit,
      depth: 1,
    });
    return docs;
  } catch {
    return [];
  }
}

export async function VideoSection({ title = 'VIDEO NỔI BẬT', channel, limit = 4, layout = 'grid' }: VideoSectionProps) {
  const channelId = typeof channel === 'object' ? channel.id : channel;
  if (!channelId) return null;

  const videos = await getVideos(channelId, limit);
  if (!videos.length) return null;

  const sectionTitle = title || 'VIDEO NỔI BẬT';

  return (
    <section className="w-full py-2">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="global-section-header">
          <h2 className="global-section-title">
            {sectionTitle}
          </h2>
          <Link href="/video" className="text-sm font-semibold text-[var(--primary)] hover:underline">
            Xem thêm »
          </Link>
        </div>

        {layout === 'featured' && videos.length > 1 ? (
          <div className="grid md:grid-cols-[2fr_1fr] gap-4">
            {/* Main video */}
            <VideoCardPopup video={videos[0]} isFeatured={true} />

            {/* Side list */}
            <div className="flex flex-col gap-3">
              {videos.slice(1).map((video: any) => (
                <VideoCardPopup key={video.id} video={video} />
              ))}
            </div>
          </div>
        ) : (
          <VideoSliderClient>
            {videos.map((video: any) => (
              <div 
                key={video.id} 
                className="flex-[0_0_85%] sm:flex-[0_0_calc(50%-0.5rem)] md:flex-[0_0_calc(33.333%-0.75rem)] lg:flex-[0_0_calc(25%-0.75rem)] min-w-0"
              >
                <VideoCardPopup video={video} />
              </div>
            ))}
          </VideoSliderClient>
        )}
      </div>
    </section>
  );
}
