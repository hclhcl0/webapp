export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { FileText, Download, Clock, AlertCircle, CheckCircle2, ChevronRight, ShoppingCart } from 'lucide-react';
import styles from './Procurements.module.css';
import { resolveFileUrl, isGoogleDriveUrl, driveLinkLabel } from '@/lib/driveUrl';

export const metadata = {
  title: 'Thông tin mua sắm | CDC Đà Nẵng',
  description: 'Thông tin mua sắm, đấu thầu của Trung tâm Kiểm soát bệnh tật Đà Nẵng.',
};

const TYPE_LABELS: Record<string, string> = {
  'thu-moi-chao-gia': 'Thư mời chào giá',
  'ket-qua-lua-chon':  'Kết quả lựa chọn nhà thầu',
  'moi-thau':          'Thông báo mời thầu',
  'thong-bao':         'Thông báo',
  'bao-cao':           'Báo cáo',
  'khac':              'Khác',
};

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  open: {
    label: 'Đang mở',
    className: styles.statusOpen,
    icon: <Clock size={12} />,
  },
  closed: {
    label: 'Đã đóng',
    className: styles.statusClosed,
    icon: <AlertCircle size={12} />,
  },
  evaluated: {
    label: 'Đã xét thầu',
    className: styles.statusEvaluated,
    icon: <CheckCircle2 size={12} />,
  },
};

function formatDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function isExpired(deadline: string | null | undefined) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

async function getProcurements() {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'procurements',
      sort: '-publishedDate',
      limit: 200,
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
  searchParams: Promise<{ status?: string }>;
}

export default async function ProcurementsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeStatus = params.status ?? '';
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

  // Filter based on active tab selection
  const items = processedItems.filter((item: any) => {
    if (activeStatus === 'open') {
      return item.effectiveStatus === 'open';
    }
    if (activeStatus === 'closed') {
      return item.effectiveStatus === 'closed';
    }
    return true; // Tất cả
  });

  const openCount   = processedItems.filter((i: any) => i.effectiveStatus === 'open').length;
  const closedCount = processedItems.filter((i: any) => i.effectiveStatus === 'closed').length;

  const tabs = [
    { label: 'Tất cả',  value: '',      count: processedItems.length },
    { label: 'Đang mở', value: 'open',   count: openCount },
    { label: 'Đã đóng', value: 'closed', count: closedCount },
  ];

  return (
    <div className="container pt-2 md:pt-4 pb-8">
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleRow}>
          <ShoppingCart size={24} className={styles.pageTitleIcon} />
          <h1 className={`${styles.pageTitle} !text-xl md:!text-2xl !mb-4`}>THÔNG TIN MUA SẮM</h1>
        </div>

      </div>

      {/* Status filter tabs */}
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/mua-sam?status=${tab.value}` : '/mua-sam'}
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
        <div className={styles.list}>
          {items.map((item: any) => {
            const sc       = STATUS_CONFIG[item.effectiveStatus] ?? STATUS_CONFIG.closed;
            const typeLabel = TYPE_LABELS[item.procurementType] ?? item.procurementType;
            const fileUrl  = resolveFileUrl(item.file?.url, item.driveUrl) || item.thumbnail?.url;
            const fileName = item.file?.filename
              ?? (item.driveUrl ? driveLinkLabel(item.driveUrl) : null)
              ?? 'file';
            const isFromDrive = !item.file?.url && isGoogleDriveUrl(item.driveUrl);
            const deadlineUrgent =
              item.deadline &&
              !item.expired &&
              (new Date(item.deadline).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000; // < 3 ngày

             return (
              <div key={item.id} className={`${styles.card} ${item.effectiveStatus === 'open' ? styles.cardOpen : ''}`}>
                {/* Left accent bar */}
                <div className={`${styles.accent} ${item.effectiveStatus === 'open' ? styles.accentOpen : styles.accentClosed}`} />

                <div className={styles.cardBody}>
                  {/* Top meta row */}
                  <div className={styles.metaRow}>
                    <span className={`${styles.statusBadge} ${sc.className}`}>
                      {sc.icon} {sc.label}
                    </span>
                    <span className={styles.typeChip}>{typeLabel}</span>
                    {item.documentNumber && (
                      <span className={styles.docNum}>{item.documentNumber}</span>
                    )}
                    <span className={styles.flex1} />
                    <span className={styles.publishDate}>Ngày đăng: {formatDate(item.publishedDate)}</span>
                  </div>

                  {/* Title */}
                  {fileUrl ? (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gov-primary transition-colors cursor-pointer">
                      <h2 className={styles.title}>{item.title}</h2>
                    </a>
                  ) : (
                    <h2 className={styles.title}>{item.title}</h2>
                  )}

                  {/* Note */}
                  {item.note && <p className={styles.note}>{item.note}</p>}

                  {/* Bottom row: deadline + download */}
                  <div className={styles.bottomRow}>
                    {item.deadline ? (
                      <div className={`${styles.deadline} ${item.expired ? styles.deadlineExpired : ''} ${deadlineUrgent ? styles.deadlineUrgent : ''}`}>
                        <Clock size={14} />
                        <span>
                          Hạn nộp:{' '}
                          <strong>{formatDate(item.deadline)}</strong>
                          {item.expired && <span className={styles.deadlineBadge}>Đã hết hạn</span>}
                          {deadlineUrgent && <span className={styles.deadlineBadge}>Sắp hết hạn</span>}
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}

                    {fileUrl && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.downloadBtn}
                      >
                        <FileText size={15} />
                        <span>{isFromDrive ? '📁 Google Drive' : 'Xem / Tải file'}</span>
                        <Download size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
