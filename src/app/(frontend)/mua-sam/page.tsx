export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { ShoppingCart, Search } from 'lucide-react';
import styles from './Procurements.module.css';
import { Pagination } from '@/components/Pagination';
import { ProcurementList } from './ProcurementList';

export const metadata = {
  title: 'Thông tin mua sắm | CDC Đà Nẵng',
  description: 'Thông tin mua sắm, đấu thầu của Trung tâm Kiểm soát bệnh tật Đà Nẵng.',
};

function isExpired(deadline: string | null | undefined) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

async function getProcurements() {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'procurements' as any,
      sort: '-publishedDate',
      limit: 2000,
      depth: 1,
      where: {
        status: {
          not_equals: 'evaluated',
        },
      },
    });
    return docs;
  } catch (e) {
    console.error('Error fetching procurements:', e);
    return [];
  }
}

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}

export default async function ProcurementsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeStatus = params.status ?? '';
  const q = params.q ?? '';
  const pageStr = params?.page;
  const page = typeof pageStr === 'string' ? parseInt(pageStr, 10) || 1 : 1;
  const limit = 15; // Items per page
  
  const rawItems = await getProcurements();

  // Process items: compute expired and effectiveStatus
  const processedItems = rawItems.map((item: any) => {
    const expired = isExpired(item.deadline);
    const effectiveStatus = (item.status === 'closed' || expired) ? 'closed' : 'open';
    return {
      ...item,
      expired,
      effectiveStatus,
    };
  });

  // Search filter
  let searchedItems = processedItems;
  if (q) {
    const lowerQ = q.toLowerCase();
    searchedItems = processedItems.filter((item: any) => 
      (item.title && item.title.toLowerCase().includes(lowerQ)) ||
      (item.documentNumber && item.documentNumber.toLowerCase().includes(lowerQ))
    );
  }

  // Filter based on active tab selection
  const filteredItems = searchedItems.filter((item: any) => {
    if (activeStatus === 'open') {
      return item.effectiveStatus === 'open';
    }
    if (activeStatus === 'closed') {
      return item.effectiveStatus === 'closed';
    }
    return true; // Tất cả
  });

  const openCount   = searchedItems.filter((i: any) => i.effectiveStatus === 'open').length;
  const closedCount = searchedItems.filter((i: any) => i.effectiveStatus === 'closed').length;

  const tabs = [
    { label: 'Tất cả',  value: '',      count: searchedItems.length },
    { label: 'Đang mở', value: 'open',   count: openCount },
    { label: 'Đã đóng', value: 'closed', count: closedCount },
  ];

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / limit);
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;
  const items = filteredItems.slice((page - 1) * limit, page * limit);

  return (
    <div className="container pt-2 md:pt-4 pb-8">
      {/* Page header */}
      <div className={`${styles.pageHeader} flex flex-col md:flex-row md:items-center justify-between gap-4 !mb-6`}>
        <div className={`${styles.pageTitleRow} !mb-0`}>
          <ShoppingCart size={24} className={styles.pageTitleIcon} />
          <h1 className={`${styles.pageTitle} !text-xl md:!text-2xl !mb-0`}>THÔNG TIN MUA SẮM</h1>
        </div>
        
        {/* Search form */}
        <form className="flex w-full md:w-auto" method="GET" action="/mua-sam">
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <div className="relative flex w-full md:w-96 shadow-sm">
            <input 
              type="search" 
              name="q" 
              defaultValue={q}
              placeholder="Tìm kiếm theo tiêu đề, số hiệu..." 
              className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-primary focus:border-transparent text-sm transition-all"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-gov-primary text-white hover:bg-gov-primary-dark p-1.5 rounded-lg transition-colors">
              <Search size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Status filter tabs */}
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? (q ? `/mua-sam?status=${tab.value}&q=${encodeURIComponent(q)}` : `/mua-sam?status=${tab.value}`) : (q ? `/mua-sam?q=${encodeURIComponent(q)}` : '/mua-sam')}
            className={`${styles.tab} ${activeStatus === tab.value ? styles.tabActive : ''}`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={styles.tabCount}>{tab.count}</span>
            )}
          </Link>
        ))}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className={styles.empty}>
          <ShoppingCart size={40} className={styles.emptyIcon} />
          <p>Không có thông tin mua sắm nào.</p>
        </div>
      ) : (
        <ProcurementList items={items} />
      )}
      
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          hasPrevPage={hasPrevPage}
          hasNextPage={hasNextPage}
        />
      )}
    </div>
  );
}
