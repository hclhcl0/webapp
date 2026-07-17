export const dynamic = 'force-dynamic';

import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { FileText } from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { GenericCategorySidebar } from '@/components/GenericCategorySidebar';
import { sortTopicsByArticleCount } from '@/lib/sortTopicsByArticleCount';
import { CategoryCover } from '@/components/CategoryCover';
import { ArticleCard } from '@/components/ArticleCard';
import { SidebarBanners } from '@/components/SidebarBanners';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  if (!slug || slug.length === 0) return {};
  const currentSlug = slug[slug.length - 1];

  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: currentSlug } },
    limit: 1,
  });

  if (docs.length === 0) return {};
  return { title: `${docs[0].name} | CDC Đà Nẵng` };
}

export default async function GenericCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  if (!slug || slug.length === 0) return notFound();

  const rootSlug = slug[0];
  const topicSlug = slug[1];
  const subtopicSlug = slug[2];
  const currentSlug = slug[slug.length - 1];

  const sp = await searchParams;
  const page = typeof sp.page === 'string' ? parseInt(sp.page) : 1;

  const payload = await getPayload({ config: configPromise });

  // 1. Lấy chuyên mục gốc
  const { docs: rootCats } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: rootSlug } },
    limit: 1,
    depth: 2,
  });
  const rootCat = rootCats[0] || null;
  if (!rootCat) return notFound();

  // 2. Lấy chuyên mục cấp 1 (con của rootCat)
  const { docs: topics } = await payload.find({
    collection: 'categories',
    where: { parent: { equals: rootCat.id } },
    sort: 'orderNum',
    limit: 100,
    depth: 0,
  });

  // 3. Lấy tất cả chuyên mục cấp 2
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
  const topicsRaw = topics.map((t: any) => ({
    ...t,
    children: allSubTopics.filter((s: any) =>
      (typeof s.parent === 'object' ? s.parent?.id : s.parent) === t.id
    ),
  }));

  // 4b. Sắp xếp topic theo số bài viết (nhiều nhất lên trên)
  const topicsWithChildren = await sortTopicsByArticleCount(topicsRaw);

  // 5. Xác định đối tượng đang được chọn
  let activeTopic: any = null;
  let activeSubTopic: any = null;
  let articleFilter: any = {};
  let currentCategory = rootCat;

  if (topicSlug) {
    activeTopic = topicsWithChildren.find((t: any) => t.slug === topicSlug) || null;
    if (activeTopic) currentCategory = activeTopic;

    if (subtopicSlug && activeTopic) {
      activeSubTopic = (activeTopic.children || []).find((c: any) => c.slug === subtopicSlug) || null;
      if (activeSubTopic) {
        currentCategory = activeSubTopic;
        articleFilter = { category: { equals: activeSubTopic.id } };
      }
    } else if (activeTopic) {
      const childIds = (activeTopic.children || []).map((c: any) => c.id);
      const allIds = [activeTopic.id, ...childIds];
      articleFilter = { category: { in: allIds } };
    }
  } else {
    // Nếu chỉ ở thư mục gốc: lấy bài của chính nó + tất cả con + cháu
    const subIds = allSubTopics.map((s: any) => s.id);
    const allIds = [rootCat.id, ...topicIds, ...subIds];
    if (allIds.length > 0) {
      articleFilter = { category: { in: allIds } };
    }
  }

  // Nếu slug nhập vào không hợp lệ với cấu trúc nhưng vẫn thuộc dạng chuyen-muc/[...]
  if (topicSlug && !activeTopic) return notFound();
  if (subtopicSlug && !activeSubTopic) return notFound();

  // 6. Lấy bài viết
  const { docs: articles, totalPages, page: currentPage, hasPrevPage, hasNextPage } = await payload.find({
    collection: 'articles',
    where: { ...articleFilter, _status: { equals: 'published' } },
    sort: ['-isPinned', '-publishedAt'],
    limit: 12,
    page,
    depth: 1,
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">

      <div className="container mx-auto px-4 max-w-7xl py-6 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <GenericCategorySidebar
            basePath={`/chuyen-muc/${rootCat.slug}`}
            rootName={rootCat.name}
            topics={topicsWithChildren}
            activeSlug={activeTopic?.slug}
            activeSubSlug={activeSubTopic?.slug}
          >
            <SidebarBanners />
          </GenericCategorySidebar>

          {/* Main Content */}
          <main className="flex-grow min-w-0">
            <CategoryCover category={currentCategory} />

            {articles.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <FileText className="w-12 h-12 mx-auto text-gray-200 mb-4" />
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
