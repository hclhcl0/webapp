export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Pagination } from '@/components/Pagination';
import { FileText, Download, ChevronRight, Calendar, Building2, Pen, Tag, Layers, Clock, CalendarX } from 'lucide-react';
import styles from './Documents.module.css';
import { resolveFileUrl, isGoogleDriveUrl, driveLinkLabel } from '@/lib/driveUrl';

export const metadata = {
  title: 'Văn bản | CDC Đà Nẵng',
  description: 'Hệ thống tra cứu văn bản của Trung tâm Kiểm soát bệnh tật Đà Nẵng.',
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'chi-thi':    'Chỉ thị',
  'quyet-dinh': 'Quyết định',
  'nghi-dinh':  'Nghị định',
  'cong-van':   'Công văn',
  'thong-bao':  'Thông báo',
  'thong-tu':   'Thông tư',
  'ke-hoach':   'Kế hoạch',
  'bao-cao':    'Báo cáo',
  'huong-dan':  'Hướng dẫn',
  'khac':       'Khác',
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

async function getDocuments(page: number = 1) {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: 'documents',
      sort: '-publishedDate',
      limit: 15,
      page: page,
      depth: 1,
    });
    return result;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return { docs: [], totalPages: 0, page: 1, hasPrevPage: false, hasNextPage: false };
  }
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  // Await searchParams in Next.js 15
  const params = await searchParams;
  const pageStr = params?.page;
  const page = typeof pageStr === 'string' ? parseInt(pageStr, 10) || 1 : 1;

  const data = await getDocuments(page);
  const documents = data.docs || [];

  return (
    <div className="container pt-2 md:pt-4 pb-8">
      <h1 className={`${styles.pageTitle} !text-xl md:!text-2xl !mb-4`}>VĂN BẢN</h1>
      <p className={styles.subtitle}>
        Hệ thống tra cứu văn bản của Trung tâm Kiểm soát bệnh tật Đà Nẵng.
      </p>

      {documents.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} className={styles.emptyIcon} />
          <p>Chưa có văn bản nào được đăng tải.</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {documents.map((doc: any) => {
            const fileUrl = resolveFileUrl(doc.file?.url, doc.driveUrl);
            const fileName = doc.file?.filename
              ?? (doc.driveUrl ? driveLinkLabel(doc.driveUrl) : null)
              ?? 'file';
            const isFromDrive = !doc.file?.url && isGoogleDriveUrl(doc.driveUrl);
            const typeLabel = DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType;

            return (
              <article key={doc.id} className={styles.docCard}>
                {/* Header */}
                <div className={styles.docCardHeader}>
                  <div className={styles.docCardIcon}>
                    <FileText size={22} />
                  </div>
                  <div className={styles.docCardMeta}>
                    {typeLabel && (
                      <span className={styles.badge}>{typeLabel}</span>
                    )}
                    {doc.field && (
                      <span className={`${styles.badge} ${styles.badgeSecondary}`}>{doc.field}</span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h2 className={styles.docCardTitle}>{doc.title}</h2>

                {/* Info table */}
                <table className={styles.infoTable}>
                  <tbody>
                    <tr>
                      <td className={styles.infoLabel}><Tag size={13} /> Số kí hiệu</td>
                      <td className={styles.infoValue}><strong>{doc.documentNumber}</strong></td>
                    </tr>
                    <tr>
                      <td className={styles.infoLabel}><Calendar size={13} /> Ngày ban hành</td>
                      <td className={styles.infoValue}>{formatDate(doc.publishedDate)}</td>
                    </tr>
                    {doc.effectiveDate && (
                      <tr>
                        <td className={styles.infoLabel}><Clock size={13} /> Ngày bắt đầu hiệu lực</td>
                        <td className={styles.infoValue}>{formatDate(doc.effectiveDate)}</td>
                      </tr>
                    )}
                    {doc.expiryDate && (
                      <tr>
                        <td className={styles.infoLabel}><CalendarX size={13} /> Ngày hết hiệu lực</td>
                        <td className={styles.infoValue}>{formatDate(doc.expiryDate)}</td>
                      </tr>
                    )}
                    {doc.documentType && (
                      <tr>
                        <td className={styles.infoLabel}><Layers size={13} /> Thể loại</td>
                        <td className={styles.infoValue}><a href="#" className={styles.infoLink}>{typeLabel}</a></td>
                      </tr>
                    )}
                    {doc.field && (
                      <tr>
                        <td className={styles.infoLabel}><Tag size={13} /> Lĩnh vực</td>
                        <td className={styles.infoValue}><a href="#" className={styles.infoLink}>{doc.field}</a></td>
                      </tr>
                    )}
                    <tr>
                      <td className={styles.infoLabel}><Building2 size={13} /> Cơ quan ban hành</td>
                      <td className={styles.infoValue}><a href="#" className={styles.infoLink}>{doc.issuer}</a></td>
                    </tr>
                    {(doc.signerRef || doc.signer) && (
                      <tr>
                        <td className={styles.infoLabel}><Pen size={13} /> Người ký</td>
                        <td className={styles.infoValue}>
                          {doc.signerRef 
                            ? (typeof doc.signerRef === 'object' ? doc.signerRef.name : doc.signerRef) 
                            : doc.signer}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* File attachment */}
                {fileUrl && (
                  <div className={styles.fileSection}>
                    <h3 className={styles.fileSectionTitle}>
                      <Download size={16} /> File đính kèm
                    </h3>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fileLink}
                    >
                      <FileText size={18} className={isFromDrive ? styles.fileLinkIconDrive : styles.fileLinkIcon} />
                      <span className={styles.fileLinkName}>
                        {isFromDrive ? '📁 ' : ''}Tải tập tin : {fileName}
                      </span>
                      <Download size={16} className={styles.fileLinkDownload} />
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {data.totalPages > 1 && (
        <Pagination
          totalPages={data.totalPages}
          currentPage={data.page}
          hasPrevPage={data.hasPrevPage}
          hasNextPage={data.hasNextPage}
        />
      )}
    </div>
  );
}
