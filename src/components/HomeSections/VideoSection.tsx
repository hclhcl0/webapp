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

function VideoCard({ video }: { video: any }) {
  const thumbUrl = video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <a
      href={video.youtubeUrl || `https://youtube.com/watch?v=${video.youtubeId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-1">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-[var(--primary)] transition-colors leading-tight">
          {video.title}
        </h4>
        {video.publishedDate && (
          <p className="text-xs text-gray-400 mt-1">
            {new Date(video.publishedDate).toLocaleDateString('vi-VN')}
          </p>
        )}
      </div>
    </a>
  );
}

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
              href={videos[0].youtubeUrl || `https://youtube.com/watch?v=${videos[0].youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={videos[0].thumbnailUrl || `https://img.youtube.com/vi/${videos[0].youtubeId}/maxresdefault.jpg`}
                  alt={videos[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1">
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
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${Math.min(videos.length, 4)}, 1fr)` }}
          >
            {videos.map((video: any) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
