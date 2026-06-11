import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import TikTokTabs from '@/components/TikTokChannelEmbed';

interface TikTokSectionProps {
  title?: string;
  channel: { id: string } | string;
  limit?: number;
}

async function getChannel(channelId: string) {
  try {
    const payload = await getPayload({ config: configPromise });
    const doc = await payload.findByID({
      collection: 'video-channels',
      id: channelId,
    });
    return doc;
  } catch {
    return null;
  }
}

export async function TikTokSection({ title = 'KÊNH TIKTOK CDC ĐÀ NẴNG', channel }: TikTokSectionProps) {
  const channelId = typeof channel === 'object' ? (channel as any).id : channel;
  if (!channelId) return null;

  const channelDoc = await getChannel(channelId);
  if (!channelDoc) return null;

  return (
    <section className="w-full py-6 my-2">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-4">
          <h2 className="text-lg md:text-xl font-bold text-[var(--primary)] tracking-wide uppercase border-l-4 border-[var(--primary)] pl-3">
            {title}
          </h2>
        </div>
        <TikTokTabs channels={[channelDoc as any]} />
      </div>
    </section>
  );
}
