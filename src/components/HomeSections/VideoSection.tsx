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
    <section className="w-full py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-[#0f2133] rounded-[2rem] p-6 lg:p-8 relative overflow-hidden shadow-2xl border border-gray-800/50">
          {/* Sparkle decoration */}
          <div className="absolute top-6 right-8 opacity-60 pointer-events-none scale-75 lg:scale-100 hidden sm:block">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 0C20 11.0457 28.9543 20 40 20C28.9543 20 20 28.9543 20 40C20 28.9543 11.0457 20 0 20C11.0457 20 20 11.0457 20 0Z" fill="white" fillOpacity="0.8"/>
              <path d="M35 10C35 12.7614 37.2386 15 40 15C37.2386 15 35 17.2386 35 20C35 17.2386 32.7614 15 30 15C32.7614 15 35 12.7614 35 10Z" fill="white" fillOpacity="0.6"/>
            </svg>
          </div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-wide flex items-center gap-2">
              <span className="text-2xl">🔥</span> {sectionTitle}
            </h2>
            <span className="text-gray-500 font-light text-2xl mb-1">|</span>
            <Link href="/video" className="text-sm font-medium text-gray-300 hover:text-white hover:underline transition-colors mt-0.5">
              Xem tất cả &gt;
            </Link>
          </div>

          {layout === 'featured' && videos.length > 1 ? (
            <div className="grid md:grid-cols-[2fr_1fr] gap-4 relative z-10">
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
            <div className="relative z-10">
              <VideoSliderClient>
                {videos.map((video: any) => (
                  <div 
                    key={video.id} 
                    className="flex-[0_0_85%] sm:flex-[0_0_calc(50%-0.5rem)] md:flex-[0_0_calc(33.333%-0.75rem)] lg:flex-[0_0_calc(25%-0.75rem)] min-w-0"
                  >
                    <VideoCardPopup video={video} variant="vertical" />
                  </div>
                ))}
              </VideoSliderClient>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
