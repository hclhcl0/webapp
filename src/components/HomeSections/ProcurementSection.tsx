import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { HomeProcurementGrid, type HomeProcurementItem } from '@/components/Procurements/HomeProcurementGrid';

interface Props {
  title?: string;
  subtitle?: string;
  columns?: '3' | '4';
  limit?: number;
  filterStatus?: 'all' | 'open_only';
  showTabs?: boolean;
  showViewAll?: boolean;
}

function isExpired(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export async function ProcurementSection({
  title = 'Thông tin Mua sắm & Đấu thầu',
  subtitle = 'Công khai, minh bạch các thông tin mua sắm, thư mời chào giá và kết quả lựa chọn nhà thầu.',
  columns = '4',
  limit = 8,
  filterStatus = 'all',
  showTabs = true,
  showViewAll = true,
}: Props) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'procurements' as any,
      sort: '-publishedDate',
      limit: 60,
      depth: 1,
    });

    if (!docs || docs.length === 0) return null;

    const items: HomeProcurementItem[] = docs.map((doc: any) => {
      const expired = isExpired(doc.deadline);
      const effectiveStatus: 'open' | 'closed' | 'evaluated' = 
        doc.status === 'evaluated'
          ? 'evaluated'
          : expired
            ? 'closed'
            : (doc.status || 'open');

      return {
        id: doc.id,
        title: doc.title,
        documentNumber: doc.documentNumber,
        procurementType: doc.procurementType || 'thu-moi-chao-gia',
        effectiveStatus,
        publishedDate: doc.publishedDate,
        deadline: doc.deadline,
        expired,
        file: doc.file,
        driveUrl: doc.driveUrl,
        thumbnail: doc.thumbnail,
        note: doc.note,
      };
    });

    const initialItems = filterStatus === 'open_only'
      ? items.filter((it) => it.effectiveStatus === 'open')
      : items;

    if (initialItems.length === 0) return null;

    return (
      <section className="w-full py-10 md:py-12 bg-slate-50/70 border-t border-slate-200/60 relative">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <HomeProcurementGrid
            title={title}
            subtitle={subtitle}
            items={initialItems}
            columns={columns}
            limit={limit}
            showTabs={showTabs}
            showViewAll={showViewAll}
          />
        </div>
      </section>
    );
  } catch (error) {
    console.error('[ProcurementSection] Error loading procurements:', error);
    return null;
  }
}
