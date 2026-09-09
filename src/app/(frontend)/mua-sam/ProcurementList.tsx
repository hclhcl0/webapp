'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  ExternalLink, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import styles from './Procurements.module.css';
import { resolveFileUrl, isGoogleDriveUrl, toDrivePreviewUrl } from '@/lib/driveUrl';

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

function formatDeadline(d: string | null | undefined) {
  if (!d) return '—';
  const dt = new Date(d);
  const hours = dt.getHours();
  const minutes = dt.getMinutes();
  const dateStr = dt.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  // Nếu có giờ cụ thể (không phải 00:00) thì hiển thị kèm giờ
  if (hours !== 0 || minutes !== 0) {
    const timeStr = dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${dateStr} lúc ${timeStr}`;
  }
  return dateStr;
}

interface ProcurementItem {
  id: number | string;
  title: string;
  documentNumber?: string | null;
  procurementType: string;
  effectiveStatus: 'open' | 'closed' | 'evaluated';
  publishedDate?: string | null;
  deadline?: string | null;
  expired?: boolean;
  file?: { url?: string; filename?: string } | null;
  driveUrl?: string | null;
  thumbnail?: { url?: string } | null;
  note?: string | null;
}

interface ProcurementListProps {
  items: ProcurementItem[];
}

export function ProcurementList({ items }: ProcurementListProps) {
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    title: string;
    docNumber?: string | null;
    isFromDrive: boolean;
  } | null>(null);

  // Đóng modal khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewDoc(null);
      }
    };
    if (previewDoc) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [previewDoc]);

  return (
    <>
      <div className={styles.list}>
        {items.map((item) => {
          const sc = STATUS_CONFIG[item.effectiveStatus] ?? STATUS_CONFIG.closed;
          const typeLabel = TYPE_LABELS[item.procurementType] ?? item.procurementType;
          const fileUrl = resolveFileUrl(item.file?.url, item.driveUrl) || item.thumbnail?.url;
          const isFromDrive = !item.file?.url && isGoogleDriveUrl(item.driveUrl);
          const isNew = item.publishedDate && (Date.now() - new Date(item.publishedDate).getTime()) < 7 * 24 * 60 * 60 * 1000;
          const deadlineUrgent =
            item.deadline &&
            !item.expired &&
            (new Date(item.deadline).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000;

          // Xử lý link xem trước (preview)
          let embedPreviewUrl = fileUrl;
          if (isFromDrive) {
            embedPreviewUrl = toDrivePreviewUrl(item.driveUrl) || fileUrl;
          }

          const handleOpenPreview = (e: React.MouseEvent) => {
            e.preventDefault();
            if (fileUrl) {
              setPreviewDoc({
                url: embedPreviewUrl || fileUrl,
                title: item.title,
                docNumber: item.documentNumber,
                isFromDrive: Boolean(isFromDrive),
              });
            }
          };

          return (
            <div 
              key={item.id} 
              className={`${styles.card} ${item.effectiveStatus === 'open' ? styles.cardOpen : ''}`}
            >
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
                  <button
                    type="button"
                    onClick={handleOpenPreview}
                    className="text-left w-full hover:text-gov-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
                  >
                    <h2 className={styles.title}>
                      {isNew && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 mr-2 align-middle uppercase tracking-wide relative -top-[1px]">
                          Mới
                        </span>
                      )}
                      {item.title}
                    </h2>
                  </button>
                ) : (
                  <h2 className={styles.title}>
                    {isNew && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 mr-2 align-middle uppercase tracking-wide relative -top-[1px]">
                        Mới
                      </span>
                    )}
                    {item.title}
                  </h2>
                )}

                {/* Note */}
                {item.note && <p className={styles.note}>{item.note}</p>}

                {/* Bottom row: deadline + actions */}
                <div className={styles.bottomRow}>
                  {item.deadline ? (
                    <div className={`${styles.deadline} ${item.expired ? styles.deadlineExpired : ''} ${deadlineUrgent ? styles.deadlineUrgent : ''}`}>
                      <Clock size={14} />
                      <span>
                        Hạn nộp:{' '}
                        <strong>{formatDeadline(item.deadline)}</strong>
                        {item.expired && <span className={styles.deadlineBadge}>Đã hết hạn</span>}
                        {deadlineUrgent && <span className={styles.deadlineBadge}>Sắp hết hạn</span>}
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}

                  {fileUrl && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenPreview}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                        title="Xem trực tiếp văn bản"
                      >
                        <Eye size={14} />
                        <span>Xem văn bản</span>
                      </button>

                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.downloadBtn}
                        title={isFromDrive ? 'Mở Google Drive' : 'Tải file đính kèm'}
                        download={!isFromDrive}
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PDF / Document Preview Modal */}
      {previewDoc && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="bg-white w-full max-w-5xl h-[92vh] max-h-[900px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-200 bg-gray-50/80 gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-gov-primary/10 text-gov-primary flex items-center justify-center flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate leading-snug">
                    {previewDoc.title}
                  </h3>
                  {previewDoc.docNumber && (
                    <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                      Số hiệu: {previewDoc.docNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={previewDoc.url}
                  download={!previewDoc.isFromDrive}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gov-primary text-white hover:bg-gov-primary-dark rounded-xl text-xs font-semibold transition-colors shadow-sm"
                  title="Tải văn bản về máy"
                >
                  <Download size={14} />
                  <span>Tải về</span>
                </a>

                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold transition-colors shadow-sm"
                  title="Mở trong cửa sổ mới"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">Mở tab mới</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-xl bg-gray-200/80 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors ml-1"
                  title="Đóng cửa sổ"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body - Iframe preview */}
            <div className="flex-1 w-full h-full bg-gray-100 relative">
              <iframe
                src={previewDoc.url}
                className="w-full h-full border-none"
                title={previewDoc.title}
                allow="autoplay"
              />
            </div>

            {/* Modal Footer / Fallback bar */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-2">
              <span>Không hiển thị được văn bản trên thiết bị của bạn?</span>
              <div className="flex items-center gap-3 font-semibold text-gov-primary">
                <a 
                  href={previewDoc.url} 
                  download={!previewDoc.isFromDrive} 
                  className="hover:underline flex items-center gap-1"
                >
                  <Download size={13} />
                  Bấm vào đây để tải file
                </a>
                <span>•</span>
                <a 
                  href={previewDoc.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={13} />
                  Mở trực tiếp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
