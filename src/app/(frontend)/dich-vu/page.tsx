export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { HeartPulse, ChevronRight, ArrowRight } from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { ServiceSidebar } from './_components/ServiceSidebar';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getServiceData({
  categorySlug,
  page = 1,
}: {
  categorySlug?: string;
  page?: number;
}) {
  const payload = await getPayload({ config: configPromise });

  // Lấy tất cả nhóm dịch vụ
  const { docs: categories } = await payload.find({
    collection: 'serviceCategories',
    sort: 'order',
    limit: 100,
    depth: 0,
  });

  // Xác định nhóm đang lọc
  let activeCategory: any = null;
  let serviceFilter: any = {};

  if (categorySlug) {
    activeCategory = categories.find((c: any) => c.slug === categorySlug) || null;
    if (activeCategory) {
      serviceFilter = { category: { equals: activeCategory.id } };
    }
  }

  // Lấy danh sách dịch vụ
  const {
    docs: services,
    totalPages,
    page: currentPage,
    hasPrevPage,
    hasNextPage,
  } = await payload.find({
    collection: 'services',
    where: { ...serviceFilter, status: { equals: 'active' } },
    sort: '-createdAt',
    limit: 12,
    page,
    depth: 1,
  });

  return {
    categories,
    activeCategory,
    services,
    totalPages,
    currentPage,
    hasPrevPage,
    hasNextPage,
  };
}

function ServiceCard({ service }: { service: any }) {
  const thumbUrl = service.thumbnail?.url || null;
  const catName = typeof service.category === 'object' ? service.category?.name : '';

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
      <Link
        href={`/dich-vu/${service.slug || service.id}`}
        className="block aspect-[4/3] bg-gray-100 overflow-hidden relative flex-shrink-0"
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-teal-50">
            <HeartPulse className="w-10 h-10 text-teal-200" />
          </div>
        )}
        {service.price && (
          <div className="absolute bottom-2 left-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-rose-600 border border-white shadow-sm">
            {service.price}
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        {catName && (
          <span className="text-xs font-bold text-gov-primary mb-2 block">{catName}</span>
        )}
        <Link href={`/dich-vu/${service.slug || service.id}`}>
          <h3 className="font-bold text-gray-900 leading-snug group-hover:text-gov-primary transition-colors line-clamp-3 text-[15px] mb-3 flex-grow">
            {service.title}
          </h3>
        </Link>
        {service.shortDescription && (
          <p className="text-[13px] text-gray-500 line-clamp-2 mb-3">{service.shortDescription}</p>
        )}
        <Link
          href={`/dich-vu/${service.slug || service.id}`}
          className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-gov-primary hover:underline"
        >
          Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default async function ServicePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = typeof sp.page === 'string' ? parseInt(sp.page) : 1;
  const categorySlug = typeof sp.category === 'string' ? sp.category : undefined;

  const {
    categories,
    activeCategory,
    services,
    totalPages,
    currentPage,
    hasPrevPage,
    hasNextPage,
  } = await getServiceData({ categorySlug, page });

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <ServiceSidebar categories={categories} activeSlug={categorySlug} />

          {/* Main Content */}
          <main className="flex-grow min-w-0">
            {/* Tiêu đề nhóm đang xem */}
            <div className="mb-5">
              <h1 className="text-xl font-extrabold text-gray-900">
                {activeCategory ? activeCategory.name : 'Tất cả Dịch vụ'}
              </h1>
              {activeCategory?.description && (
                <p className="text-sm text-gray-500 mt-1">{activeCategory.description}</p>
              )}
            </div>

            {services.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <HeartPulse className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                <p>Chưa có dịch vụ nào trong nhóm này.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {services.map((service: any) => (
                    <ServiceCard key={service.id} service={service} />
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
