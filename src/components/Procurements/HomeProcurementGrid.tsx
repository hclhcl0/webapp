'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  ExternalLink, 
  X,
  Calendar,
  ArrowRight,
  ShoppingBag,
  Sparkles,
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
    label: 'Kết quả lựa chọn nhà thầu',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
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
    label: 'Đang mở hồ sơ',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
    dotClass: 'bg-emerald-500 animate-pulse',
  },
  closed: {
    label: 'Đã đóng',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
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
    return `${timeStr} ngày ${dateStr}`;
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
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' 
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5';

  return (
    <div className="w-full">
      {/* ── Section Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-200/80">
            <ShoppingBag size={13} className="text-emerald-600" />
            <span>Mua sắm & Đấu thầu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {showViewAll && (
          <Link
            href="/mua-sam"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-emerald-700 text-sm font-semibold transition-all shadow-sm group self-start md:self-auto"
          >
            <span>Xem tất cả thông báo</span>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </Link>
        )}
      </div>

      {/* ── Tab Filter Bar ── */}
      {showTabs && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Tất cả</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('open')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'open'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Đang mở hồ sơ</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'open' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              {counts.open}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('closed')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'closed'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Đã đóng</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'closed' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {counts.closed}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evaluated')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'evaluated'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
            }`}
          >
            <span>Kết quả xét thầu</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'evaluated' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
              {counts.evaluated}
            </span>
          </button>
        </div>
      )}

      {/* ── Modern Grid Cards ── */}
      {displayedItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <Inbox size={26} />
          </div>
          <h3 className="text-base font-semibold text-slate-700">Chưa có thông báo nào trong mục này</h3>
          <p className="text-xs text-slate-500 mt-1">Vui lòng chọn tab khác hoặc quay lại xem sau.</p>
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
                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group p-5"
              >
                <div>
                  {/* Card Top: Document number & Status Pill */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-mono font-bold tracking-wide">
                      <FileText size={12} className="text-slate-400" />
                      <span className="truncate max-w-[120px]">{item.documentNumber || 'VĂN BẢN'}</span>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}>
                      {statusInfo.dotClass && (
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                      )}
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>

                  {/* Procurement Type Badge */}
                  <div className="mb-2.5">
                    <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${typeInfo.badgeClass}`}>
                      {typeInfo.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={fileUrl ? handleOpenPreview : undefined}
                    className={`text-[15px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-3 leading-snug mb-3.5 ${
                      fileUrl ? 'cursor-pointer' : ''
                    }`}
                    title={item.title}
                  >
                    {isNew && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-red-500 text-white mr-1.5 align-middle uppercase tracking-wider">
                        Mới
                      </span>
                    )}
                    {item.title}
                  </h3>

                  {/* Note if any */}
                  {item.note && (
                    <p className="text-xs text-slate-500 line-clamp-2 italic mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {item.note}
                    </p>
                  )}
                </div>

                {/* Card Bottom: Metadata, Deadline Box & Actions */}
                <div className="mt-2 pt-3 border-t border-slate-100">
                  {/* Published Date */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5">
                    <Calendar size={13} className="text-slate-400" />
                    <span>
                      Ngày đăng: <strong className="text-slate-700 font-semibold">{formatDate(item.publishedDate)}</strong>
                    </span>
                  </div>

                  {/* Deadline Box */}
                  {item.deadline ? (
                    <div
                      className={`rounded-xl p-2.5 text-xs border mb-3.5 transition-all ${
                        isUrgent
                          ? 'bg-amber-50/90 border-amber-200 text-amber-950 shadow-sm'
                          : item.effectiveStatus === 'open'
                          ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Clock
                          size={14}
                          className={`flex-shrink-0 mt-0.5 ${
                            isUrgent
                              ? 'text-amber-600'
                              : item.effectiveStatus === 'open'
                              ? 'text-emerald-600'
                              : 'text-slate-400'
                          }`}
                        />
                        <div className="min-w-0 flex-1 leading-snug">
                          <div className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">
                            {item.effectiveStatus === 'open' ? 'Hạn nộp hồ sơ' : 'Thời hạn nộp'}
                          </div>
                          <div className="font-bold text-[12px] text-slate-800">
                            {formatDeadline(item.deadline)}
                          </div>
                          {isUrgent && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold">
                              ⚡ {urgentLabel}
                            </span>
                          )}
                          {item.expired && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-medium">
                              Đã hết hạn nộp
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl p-2.5 text-xs bg-slate-50 border border-slate-100 text-slate-500 mb-3.5 flex items-center gap-2">
                      <Clock size={13} className="text-slate-400" />
                      <span>Không quy định thời hạn</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {fileUrl ? (
                      <>
                        <button
                          type="button"
                          onClick={handleOpenPreview}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm group/btn"
                        >
                          <Eye size={14} className="group-hover/btn:scale-110 transition-transform" />
                          <span>Xem văn bản</span>
                        </button>

                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={!isFromDrive}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title={isFromDrive ? 'Mở Google Drive' : 'Tải file đính kèm'}
                        >
                          <Download size={15} />
                        </a>
                      </>
                    ) : (
                      <Link
                        href="/mua-sam"
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight size={13} />
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
        <div className="mt-6 text-center md:hidden">
          <Link
            href="/mua-sam"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm shadow-sm hover:bg-slate-50"
          >
            <span>Xem tất cả thông báo mua sắm</span>
            <ArrowRight size={16} />
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
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-200 bg-gray-50/80 gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
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

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={previewDoc.url}
                  download={!previewDoc.isFromDrive}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-semibold transition-colors shadow-sm"
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
                  <X size={16} />
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
