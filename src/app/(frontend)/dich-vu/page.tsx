export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { HeartPulse, Calendar, Eye, ArrowRight, ChevronRight } from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { ServiceSidebar } from './_components/ServiceSidebar';
import { CategoryCover } from '@/components/CategoryCover';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ---- Lấy dữ liệu chuyên mục + bài viết theo cấu trúc giống trang Sức khỏe ----
export async function getServicePageData({
  topicSlug,
  subtopicSlug,
  page = 1,
}: {
  topicSlug?: string;
  subtopicSlug?: string;
  page?: number;
}) {
  const payload = await getPayload({ config: configPromise });

  // 1. Lấy chuyên mục gốc "dich-vu"
  const { docs: rootCats } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'dich-vu' } },
    limit: 1,
    depth: 2,
  });
  const rootCat = rootCats[0] || null;

  // 2. Lấy chuyên mục cấp 1 (con trực tiếp của dich-vu)
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
  const { docs: allSubTopics } =
    topicIds.length > 0
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
    children: allSubTopics.filter(
      (s: any) => (typeof s.parent === 'object' ? s.parent?.id : s.parent) === t.id,
    ),
  }));

  // 5. Xác định topic/subtopic đang xem + bộ lọc bài viết
  let activeTopic: any = null;
  let activeSubTopic: any = null;
  let articleFilter: any = {};

  if (topicSlug) {
    activeTopic = topicsWithChildren.find((t: any) => t.slug === topicSlug) || null;

    if (subtopicSlug && activeTopic) {
      activeSubTopic =
        (activeTopic.children || []).find((c: any) => c.slug === subtopicSlug) || null;
      if (activeSubTopic) {
        articleFilter = { category: { equals: activeSubTopic.id } };
      }
    } else if (activeTopic) {
      const childIds = (activeTopic.children || []).map((c: any) => c.id);
      const allIds = [activeTopic.id, ...childIds];
      articleFilter = { category: { in: allIds } };
    }
  } else if (rootCat) {
    // Trang /dich-vu: lấy bài của tất cả topic + subtopic
    const subIds = allSubTopics.map((s: any) => s.id);
    const allIds = [...topicIds, ...subIds];
    if (allIds.length > 0) {
      articleFilter = { category: { in: allIds } };
    }
  }

  // 6. Lấy bài viết (ghim lên trước, rồi mới theo ngày mới nhất)
  const {
    docs: articles,
    totalPages,
    page: currentPage,
    hasPrevPage,
    hasNextPage,
  } = await payload.find({
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

// ---- Thẻ bài viết ----
function ArticleCard({ article }: { article: any }) {
  const imgUrl = article.image?.url || null;
  const date = new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN');
  const catName = article.category?.name || '';

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
      <Link
        href={`/bai-viet/${article.slug || article.id}`}
        className="block aspect-video bg-gray-100 overflow-hidden relative"
      >
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
        {article.isPinned && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-white text-[11px] font-bold rounded-full shadow flex items-center gap-1">
            📌 Ghim
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
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {article.views || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Trang chính ----
export default async function DichVuPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = typeof sp.page === 'string' ? parseInt(sp.page) : 1;
  const topicSlug = typeof sp.topic === 'string' ? sp.topic : undefined;
  const subtopicSlug = typeof sp.subtopic === 'string' ? sp.subtopic : undefined;

  const { rootCat, topics, activeTopic, activeSubTopic, articles, totalPages, currentPage, hasPrevPage, hasNextPage } =
    await getServicePageData({ topicSlug, subtopicSlug, page });

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      <CategoryCover category={rootCat} />
      <div className="container mx-auto px-4 max-w-7xl py-6 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <ServiceSidebar
            topics={topics}
            activeSlug={topicSlug}
            activeSubSlug={subtopicSlug}
          />

          {/* Main Content */}
          <main className="flex-grow min-w-0">
            {/* Tiêu đề chuyên mục đang xem */}
            {(activeTopic || activeSubTopic) && (
              <div className="mb-5">
                <h1 className="text-xl font-extrabold text-gray-900">
                  {activeSubTopic?.name || activeTopic?.name}
                </h1>
              </div>
            )}

            {articles.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <HeartPulse className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                <p>Chưa có bài viết nào trong chuyên mục này.</p>
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
