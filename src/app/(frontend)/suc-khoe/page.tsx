export const revalidate = 60;

import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Calendar, Eye, ChevronRight, HeartPulse } from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { HealthSidebar } from './_components/HealthSidebar';
import { CategoryCover } from '@/components/CategoryCover';
import { SidebarBanners } from '@/components/SidebarBanners';
import { ArticleCard } from '@/components/ArticleCard';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ---- Shared helper: fetch categories + articles ----
export async function getHealthData({
  topicSlug,
  subtopicSlug,
  page = 1,
}: {
  topicSlug?: string;
  subtopicSlug?: string;
  page?: number;
}) {
  const payload = await getPayload({ config: configPromise });

  // 1. Lấy chuyên mục gốc "suc-khoe"
  const { docs: rootCats } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'suc-khoe' } },
    limit: 1,
    depth: 2,
  });
  const rootCat = rootCats[0] || null;

  // 2. Lấy chuyên mục cấp 1 (con của suc-khoe)
  const { docs: topics } = rootCat
    ? await payload.find({
        collection: 'categories',
        where: { parent: { equals: rootCat.id } },
        sort: 'orderNum',
        limit: 100,
        depth: 0,
      })
    : { docs: [] };

  // 3. Lấy tất cả chuyên mục cấp 2 (con của các topics)
  const topicIds = topics.map((t: any) => t.id);
  const { docs: allSubTopics } = topicIds.length > 0
    ? await payload.find({
        collection: 'categories',
        where: { parent: { in: topicIds } },
        sort: 'orderNum',
        limit: 500,
        depth: 0,
      })
    : { docs: [] };

  // 4. Gắn children vào mỗi topic
  const topicsWithChildren = topics.map((t: any) => ({
    ...t,
    children: allSubTopics.filter((s: any) =>
      (typeof s.parent === 'object' ? s.parent?.id : s.parent) === t.id
    ),
  }));

  // 5. Xác định activeTopic + activeSubTopic + articleFilter
  let activeTopic: any = null;
  let activeSubTopic: any = null;
  let articleFilter: any = {};

  if (topicSlug) {
    activeTopic = topicsWithChildren.find((t: any) => t.slug === topicSlug) || null;

    if (subtopicSlug && activeTopic) {
      // Đang xem chủ đề con → lọc chỉ theo subtopic
      activeSubTopic = (activeTopic.children || []).find((c: any) => c.slug === subtopicSlug) || null;
      if (activeSubTopic) {
        articleFilter = { category: { equals: activeSubTopic.id } };
      }
    } else if (activeTopic) {
      // Đang xem chủ đề mẹ → gộp bài của mẹ + tất cả con
      const childIds = (activeTopic.children || []).map((c: any) => c.id);
      const allIds = [activeTopic.id, ...childIds];
      articleFilter = { category: { in: allIds } };
    }
  } else if (rootCat) {
    // Trang /suc-khoe: lấy bài của tất cả topic cấp 1 + cấp 2
    const subIds = allSubTopics.map((s: any) => s.id);
    const allIds = [...topicIds, ...subIds];
    if (allIds.length > 0) {
      articleFilter = { category: { in: allIds } };
    }
  }

  // 6. Lấy bài viết
  const { docs: articles, totalPages, page: currentPage, hasPrevPage, hasNextPage } =
    await payload.find({
      collection: 'articles',
      where: { ...articleFilter, _status: { equals: 'published' } },
      sort: ['-isPinned', '-publishedAt'],
      limit: 12,
      page,
      depth: 1,
    });

  return {
    rootCat,
    topics: topicsWithChildren,
    activeTopic,
    activeSubTopic,
    articles,
    totalPages,
    currentPage,
    hasPrevPage,
    hasNextPage,
  };
}

// Card component has been moved to @/components/ArticleCard

// ---- Page ----
export default async function SucKhoePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = typeof sp.page === 'string' ? parseInt(sp.page) : 1;

  const { rootCat, topics, articles, totalPages, currentPage, hasPrevPage, hasNextPage } =
    await getHealthData({ page });

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      <div className="container mx-auto px-4 max-w-7xl py-6 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <HealthSidebar topics={topics}>
            <SidebarBanners />
          </HealthSidebar>

          {/* Main Content */}
          <main className="flex-grow min-w-0">
            <CategoryCover category={rootCat} />
            {articles.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <HeartPulse className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                <p>Chưa có bài viết nào trong chuyên mục Sức khỏe.</p>
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
