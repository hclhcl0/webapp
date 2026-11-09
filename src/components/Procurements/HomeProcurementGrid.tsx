'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Clock, 
  Eye, 
  ExternalLink, 
  X, 
  Calendar, 
  ArrowRight, 
  ShoppingBag, 
  Inbox 
} from 'lucide-react';
import { resolveFileUrl, isGoogleDriveUrl, toDrivePreviewUrl } from '@/lib/driveUrl';

export interface HomeProcurementItem {
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

interface HomeProcurementGridProps {
  title?: string;
  subtitle?: string;
  items: HomeProcurementItem[];
  columns?: '3' | '4';
  limit?: number;
  showTabs?: boolean;
  showViewAll?: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  'thu-moi-chao-gia': {
    label: 'Thư mời chào giá',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
  },
  'moi-thau': {
    label: 'Thông báo mời thầu',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80',
  },
  'ket-qua-lua-chon': {
    label: 'Kết quả lựa chọn',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80',
  },
  'thong-bao': {
    label: 'Thông báo',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200/80',
  },
  'bao-cao': {
    label: 'Báo cáo',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  'khac': {
    label: 'Khác',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; dotClass?: string }> = {
  open: {
    label: 'Đang mở',
    badgeClass: 'bg-[#f0f9fa] text-[#007a8c] border-[#d0eef2]',
    dotClass: 'bg-[#009aae] animate-pulse',
  },
  closed: {
    label: 'Đã đóng',
    badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
    dotClass: 'bg-slate-400',
  },
  evaluated: {
    label: 'Đã xét thầu',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
};

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDeadline(d: string | null | undefined): string {
  if (!d) return '—';
  const dt = new Date(d);
  const hours = dt.getHours();
  const minutes = dt.getMinutes();
  const dateStr = dt.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  if (hours !== 0 || minutes !== 0) {
    const timeStr = dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${timeStr} ${dateStr}`;
  }
  return dateStr;
}

function getDeadlineUrgency(deadline: string | null | undefined, isExpired: boolean | undefined) {
  if (!deadline || isExpired) return { isUrgent: false, label: '' };
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs <= 0) return { isUrgent: false, label: '' };
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays <= 3) {
    if (diffDays === 0) {
      return { isUrgent: true, label: `Còn ${diffHours}h` };
    }
    return { isUrgent: true, label: `Còn ${diffDays} ngày` };
  }
  return { isUrgent: false, label: '' };
}

export function HomeProcurementGrid({
  title = 'Thông tin Mua sắm & Đấu thầu',
  subtitle = 'Công khai, minh bạch các gói mua sắm, thư mời chào giá và kết quả lựa chọn nhà thầu.',
  items = [],
  columns = '4',
  limit = 8,
  showTabs = true,
  showViewAll = true,
}: HomeProcurementGridProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'closed' | 'evaluated'>('all');
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    title: string;
    docNumber?: string | null;
    isFromDrive: boolean;
  } | null>(null);

  // Keyboard shortcut ESC to close preview modal
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

  // Tab counts
  const counts = useMemo(() => {
    const res = { all: items.length, open: 0, closed: 0, evaluated: 0 };
    items.forEach((it) => {
      if (it.effectiveStatus === 'open') res.open++;
      else if (it.effectiveStatus === 'closed') res.closed++;
      else if (it.effectiveStatus === 'evaluated') res.evaluated++;
    });
    return res;
  }, [items]);

  // Filtered items by tab with limit applied
  const displayedItems = useMemo(() => {
    const list = activeTab === 'all'
      ? items
      : items.filter((it) => it.effectiveStatus === activeTab);
    return limit ? list.slice(0, limit) : list;
  }, [items, activeTab, limit]);

  const gridColsClass = columns === '3' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4' 
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4';

  return (
    <div className="w-full">
      {/* ── Section Header (Gọn gàng & Đồng bộ màu CDC) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0f9fa] text-[#007a8c] text-[11px] font-bold uppercase tracking-wider mb-1 border border-[#d0eef2]">
            <ShoppingBag size={12} className="text-[#007a8c]" />
            <span>Mua sắm & Đấu thầu</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#005a68] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {showViewAll && (
          <Link
            href="/mua-sam"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#007a8c] hover:text-[#005a68] hover:underline group"
          >
            <span>Xem tất cả thông báo</span>
            <ArrowRight size={14} className="text-[#007a8c] group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* ── Tab Filter Bar (Gọn gàng & Đồng bộ màu CDC) ── */}
      {showTabs && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#005a68] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-[#f0f9fa] hover:text-[#007a8c] border border-slate-200'
            }`}
          >
            <span>Tất cả</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('open')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'open'
                ? 'bg-[#007a8c] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-[#f0f9fa] hover:text-[#007a8c] border border-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#38d4eb] animate-pulse" />
            <span>Đang mở hồ sơ</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'open' ? 'bg-white/20 text-white' : 'bg-[#d0eef2] text-[#005a68]'}`}>
              {counts.open}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('closed')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'closed'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Đã đóng</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'closed' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {counts.closed}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evaluated')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'evaluated'
                ? 'bg-[#2563eb] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
            }`}
          >
            <span>Kết quả xét thầu</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'evaluated' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
              {counts.evaluated}
            </span>
          </button>
        </div>
      )}

      {/* ── Compact Grid Cards ── */}
      {displayedItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <Inbox size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">Chưa có thông báo nào trong mục này</h3>
          <p className="text-xs text-slate-500 mt-0.5">Vui lòng chọn tab khác hoặc quay lại xem sau.</p>
        </div>
      ) : (
        <div className={gridColsClass}>
          {displayedItems.map((item) => {
            const fileUrl = resolveFileUrl(item.file?.url, item.driveUrl) || item.thumbnail?.url;
            const isFromDrive = isGoogleDriveUrl(item.driveUrl);
            const typeInfo = TYPE_CONFIG[item.procurementType] || TYPE_CONFIG['khac'];
            const statusInfo = STATUS_CONFIG[item.effectiveStatus] || STATUS_CONFIG['closed'];
            const { isUrgent, label: urgentLabel } = getDeadlineUrgency(item.deadline, item.expired);

            const isNew = item.publishedDate
              ? Date.now() - new Date(item.publishedDate).getTime() < 5 * 24 * 60 * 60 * 1000
              : false;

            const handleOpenPreview = () => {
              if (!fileUrl) return;
              let previewUrl: string | null = null;
              if (isFromDrive && item.driveUrl) {
                previewUrl = toDrivePreviewUrl(item.driveUrl);
              } else if (fileUrl) {
                previewUrl = `${fileUrl}#toolbar=1`;
              }

              if (previewUrl) {
                setPreviewDoc({
                  url: previewUrl,
                  title: item.title,
                  docNumber: item.documentNumber,
                  isFromDrive,
                });
              } else {
                window.open(fileUrl, '_blank', 'noopener,noreferrer');
              }
            };

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_16px_rgba(0,122,140,0.08)] hover:border-[#007a8c]/50 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden group p-3.5"
              >
                <div>
                  {/* Card Top: Type + Doc Number & Status in 1 Single Row */}
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border truncate ${typeInfo.badgeClass}`}>
                        {typeInfo.label}
                      </span>
                      {item.documentNumber && (
                        <span className="text-[10px] font-mono text-slate-500 truncate" title={item.documentNumber}>
                          #{item.documentNumber}
                        </span>
                      )}
                    </div>

                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ${statusInfo.badgeClass}`}>
                      {statusInfo.dotClass && (
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                      )}
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>

                  {/* Title (2 lines clamp, neat typography) */}
                  <h3
                    onClick={fileUrl ? handleOpenPreview : undefined}
                    className={`text-[13px] font-bold text-slate-800 group-hover:text-[#007a8c] transition-colors line-clamp-2 leading-snug mb-2 ${
                      fileUrl ? 'cursor-pointer' : ''
                    }`}
                    title={item.title}
                  >
                    {isNew && (
                      <span className="inline-flex items-center px-1 py-0.2 rounded text-[9px] font-extrabold bg-red-500 text-white mr-1 align-middle uppercase tracking-wide">
                        Mới
                      </span>
                    )}
                    {item.title}
                  </h3>
                </div>

                {/* Card Bottom: Compact Deadline & Slim Actions */}
                <div className="mt-1">
                  {/* Compact Deadline / Date Row */}
                  {item.deadline ? (
                    <div
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] border mb-2.5 flex items-center justify-between gap-1.5 ${
                        isUrgent
                          ? 'bg-amber-50/90 border-amber-200 text-amber-950 font-medium'
                          : item.effectiveStatus === 'open'
                          ? 'bg-[#f0f9fa] border-[#d0eef2] text-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock
                          size={12}
                          className={`flex-shrink-0 ${
                            isUrgent
                              ? 'text-amber-600'
                              : item.effectiveStatus === 'open'
                              ? 'text-[#007a8c]'
                              : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">Hạn: <strong>{formatDeadline(item.deadline)}</strong></span>
                      </div>
                      {isUrgent && (
                        <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded text-[9px] font-bold flex-shrink-0">
                          {urgentLabel}
                        </span>
                      )}
                      {item.expired && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          Hết hạn
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="px-2 py-1 text-[11px] text-slate-400 mb-2 flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                      <span>Đăng ngày: {formatDate(item.publishedDate)}</span>
                    </div>
                  )}

                  {/* Action Buttons (Slim) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                    {fileUrl ? (
                      <>
                        <button
                          type="button"
                          onClick={handleOpenPreview}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#f0f9fa] hover:bg-[#007a8c] text-[#007a8c] hover:text-white border border-[#d0eef2] hover:border-[#007a8c] rounded-lg text-[11px] font-semibold transition-all shadow-2xs group/btn"
                        >
                          <Eye size={13} className="group-hover/btn:scale-110 transition-transform" />
                          <span>Xem văn bản</span>
                        </button>

                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={!isFromDrive}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title={isFromDrive ? 'Mở Google Drive' : 'Tải file đính kèm'}
                        >
                          <Download size={13} />
                        </a>
                      </>
                    ) : (
                      <Link
                        href="/mua-sam"
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile view all link */}
      {showViewAll && (
        <div className="mt-4 text-center sm:hidden">
          <Link
            href="/mua-sam"
            className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-white border border-[#d0eef2] text-[#007a8c] font-semibold text-xs shadow-xs hover:bg-[#f0f9fa]"
          >
            <span>Xem tất cả thông báo mua sắm</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* ── Document Preview Modal ── */}
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
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50/80 gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-[#f0f9fa] border border-[#d0eef2] text-[#007a8c] flex items-center justify-center flex-shrink-0">
                  <FileText size={16} />
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

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={previewDoc.url}
                  download={!previewDoc.isFromDrive}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-[#007a8c] text-white hover:bg-[#005a68] rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  title="Tải văn bản về máy"
                >
                  <Download size={13} />
                  <span>Tải về</span>
                </a>

                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  title="Mở trong cửa sổ mới"
                >
                  <ExternalLink size={13} />
                  <span className="hidden sm:inline">Mở tab mới</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="w-7 h-7 rounded-lg bg-gray-200/80 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors ml-1"
                  title="Đóng cửa sổ"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Modal Body / iframe */}
            <div className="flex-1 bg-gray-100 relative">
              <iframe
                src={previewDoc.url}
                className="w-full h-full border-0"
                title={previewDoc.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
