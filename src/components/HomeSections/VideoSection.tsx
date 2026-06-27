import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

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

function getYoutubeId(url: string) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

function VideoCard({ video }: { video: any }) {
  const yId = getYoutubeId(video.videoUrl);
  const thumbUrl = video.thumbnail?.url || (yId ? `https://img.youtube.com/vi/${yId}/hqdefault.jpg` : '');

  return (
    <a
      href={video.videoUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-gray-400">Không có ảnh thu nhỏ</span>
        )}
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 border border-white/30">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1 drop-shadow-md">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-[var(--primary)] transition-colors leading-tight">
          {video.title}
        </h4>
        {video.publishedDate && (
          <p className="text-xs text-gray-400 mt-auto pt-2">
            {new Date(video.publishedDate).toLocaleDateString('vi-VN')}
          </p>
        )}
      </div>
    </a>
  );
}

import VideoSliderClient from './VideoSliderClient';

export async function VideoSection({ title = 'VIDEO NỔI BẬT', channel, limit = 4, layout = 'grid' }: VideoSectionProps) {
  const channelId = typeof channel === 'object' ? channel.id : channel;
  if (!channelId) return null;

  const videos = await getVideos(channelId, limit);
  if (!videos.length) return null;

  const sectionTitle = title || 'VIDEO NỔI BẬT';

  return (
    <section className="w-full py-6 my-2">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold text-[var(--primary)] tracking-wide uppercase border-l-4 border-[var(--primary)] pl-3">
            {sectionTitle}
          </h2>
          <a
            href="/video"
            className="text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            Xem thêm »
          </a>
        </div>

        {layout === 'featured' && videos.length > 1 ? (
          <div className="grid md:grid-cols-[2fr_1fr] gap-4">
            {/* Main video */}
            <a
              href={videos[0].videoUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-100 flex items-center justify-center">
                {videos[0].thumbnail?.url || getYoutubeId(videos[0].videoUrl) ? (
                  <img
                    src={videos[0].thumbnail?.url || `https://img.youtube.com/vi/${getYoutubeId(videos[0].videoUrl)}/maxresdefault.jpg`}
                    alt={videos[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-gray-400">Không có ảnh thu nhỏ</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 border border-white/30">
                    <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1.5 drop-shadow-md">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-base text-gray-800 group-hover:text-[var(--primary)] transition-colors">
                  {videos[0].title}
                </h3>
              </div>
            </a>

            {/* Side list */}
            <div className="flex flex-col gap-3">
              {videos.slice(1).map((video: any) => (
                <VideoCard key={video.id} video={video} />
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
                <VideoCard video={video} />
              </div>
            ))}
          </VideoSliderClient>
        )}
      </div>
    </section>
  );
}
