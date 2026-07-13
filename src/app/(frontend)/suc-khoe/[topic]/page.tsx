export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, HeartPulse } from 'lucide-react';
import { getHealthData, ArticleCard } from '../page';
import { HealthSidebar } from '../_components/HealthSidebar';
import { Pagination } from '@/components/Pagination';

interface PageProps {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { topic } = await params;
  const { activeTopic } = await getHealthData({ topicSlug: topic });
  return {
    title: activeTopic ? `${activeTopic.name} | CDC Đà Nẵng` : 'Sức khỏe | CDC Đà Nẵng',
  };
}

export default async function HealthTopicPage({ params, searchParams }: PageProps) {
  const { topic } = await params;
  const sp = await searchParams;
  const page = typeof sp.page === 'string' ? parseInt(sp.page) : 1;

  const { topics, activeTopic, articles, totalPages, currentPage, hasPrevPage, hasNextPage } =
    await getHealthData({ topicSlug: topic, page });

  if (!activeTopic) return notFound();

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <HealthSidebar topics={topics} activeSlug={topic} />

          {/* Main Content */}
          <main className="flex-grow min-w-0">
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
