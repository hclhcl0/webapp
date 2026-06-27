import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import TikTokChannelEmbed from '@/components/TikTokChannelEmbed';

interface TikTokSectionProps {
  title?: string;
  channel: { id: string } | string;
  limit?: number;
}

export async function TikTokSection({ title = 'KÊNH TIKTOK CDC ĐÀ NẴNG', channel }: TikTokSectionProps) {
  const channelId = typeof channel === 'object' ? (channel as any).id : channel;
  if (!channelId) return null;

  try {
    const payload = await getPayload({ config: configPromise });
    const doc = await payload.findByID({ collection: 'video-channels', id: channelId }) as any;
    if (!doc || !doc.tiktokHandle) return null;

    const mappedChannel = {
      id: String(doc.id),
      handle: doc.tiktokHandle,
      channelName: doc.name,
      channelUrl: doc.channelUrl,
      avatarUrl: doc.avatar?.url,
    };

    return (
      <section className="w-full py-6 my-2">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-[var(--primary)] tracking-wide uppercase border-l-4 border-[var(--primary)] pl-3">
              {title}
            </h2>
            <a
              href={doc.channelUrl || `https://www.tiktok.com/@${doc.tiktokHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              Xem thêm »
            </a>
          </div>
          <TikTokChannelEmbed channels={[mappedChannel]} />
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
