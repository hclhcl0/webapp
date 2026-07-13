export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, HeartPulse } from 'lucide-react';
import { getHealthData, ArticleCard } from '../../page';
import { CategoryCover } from '@/components/CategoryCover';
import { HealthSidebar } from '../../_components/HealthSidebar';
import { Pagination } from '@/components/Pagination';
import { SidebarBanners } from '@/components/SidebarBanners';

interface PageProps {
  params: Promise<{ topic: string; subtopic: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { topic, subtopic } = await params;
  const { activeTopic, activeSubTopic } = await getHealthData({ topicSlug: topic, subtopicSlug: subtopic });
  const name = activeSubTopic?.name || activeTopic?.name || 'Sức khỏe';
  return { title: `${name} | CDC Đà Nẵng` };
}

export default async function HealthSubTopicPage({ params, searchParams }: PageProps) {
  const { topic, subtopic } = await params;
  const sp = await searchParams;
  const page = typeof sp.page === 'string' ? parseInt(sp.page) : 1;

  const { rootCat, topics, activeTopic, activeSubTopic, articles, totalPages, currentPage, hasPrevPage, hasNextPage } =
    await getHealthData({ topicSlug: topic, subtopicSlug: subtopic, page });

  if (!activeTopic || !activeSubTopic) return notFound();

  const activeSubtopic = topics.find((t: any) => t.slug === topic)?.children?.find((c: any) => c.slug === subtopic);
  // Nếu có activeSubtopic thì lấy cover của nó, ngược lại dùng của rootCat
  const coverTarget = activeSubtopic?.coverImage ? activeSubtopic : rootCat;

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      <div className="container mx-auto px-4 max-w-7xl py-6 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar – mở sẵn accordion chủ đề mẹ, highlight subtopic */}
          <HealthSidebar topics={topics} activeSlug={topic} activeSubSlug={subtopic}>
            <SidebarBanners />
          </HealthSidebar>

          {/* Main Content */}
          <main className="flex-grow min-w-0">
            <CategoryCover category={coverTarget} />
            {articles.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <HeartPulse className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                <p>Chưa có bài viết nào trong chủ đề này.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {articles.map((article: any) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                <div className="mt-8">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage || 1}
                    hasPrevPage={hasPrevPage}
                    hasNextPage={hasNextPage}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
