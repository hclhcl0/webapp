export const revalidate = 60;

import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Calendar, Eye, ChevronRight, HeartPulse } from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { HealthSidebar } from './_components/HealthSidebar';
import { CategoryCover } from '@/components/CategoryCover';

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

// ---- Article Card ----
export function ArticleCard({ article, featured = false }: { article: any; featured?: boolean }) {
  const imgUrl = article.image?.url || null;
  const date = new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN');
  const catName = article.category?.name || '';

  if (featured) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow group mb-6">
        <div className="flex flex-col md:flex-row">
          <Link
            href={`/bai-viet/${article.slug || article.id}`}
            className="md:w-1/2 aspect-video md:aspect-auto block overflow-hidden bg-gray-100 flex-shrink-0"
          >
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-teal-50">
                <HeartPulse className="w-16 h-16 text-teal-200" />
              </div>
            )}
          </Link>
          <div className="p-6 flex flex-col justify-center flex-grow">
            {catName && (
              <span className="inline-block text-xs font-bold text-gov-primary bg-teal-50 px-3 py-1 rounded-full mb-3 w-fit">
                {catName}
              </span>
            )}
            <Link href={`/bai-viet/${article.slug || article.id}`}>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug group-hover:text-gov-primary transition-colors line-clamp-3 mb-3">
                {article.title}
              </h2>
            </Link>
            {article.description && (
              <p className="text-gray-500 text-sm line-clamp-3 mb-4">{article.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{date}</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{article.views || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
      <Link href={`/bai-viet/${article.slug || article.id}`} className="block aspect-video bg-gray-100 overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-teal-50">
            <HeartPulse className="w-10 h-10 text-teal-200" />
          </div>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        {catName && (
          <span className="text-xs font-bold text-gov-primary mb-2 block">{catName}</span>
        )}
        <Link href={`/bai-viet/${article.slug || article.id}`}>
          <h3 className="font-bold text-gray-900 leading-snug group-hover:text-gov-primary transition-colors line-clamp-3 text-sm mb-3 flex-grow">
            {article.title}
          </h3>
        </Link>
        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-auto">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views || 0}</span>
        </div>
      </div>
    </div>
  );
}

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
          <HealthSidebar topics={topics} />

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
