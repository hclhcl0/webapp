"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  Eye,
  X,
  Image as ImageIcon,
  Headphones,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileEdit,
  Video,
  LayoutGrid,
  List,
  FileArchive,
  FolderOpen,
  HardDrive,
  ArrowUpRight,
  Film,
  Mic,
  Send,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

export interface CdcMediaItem {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor?: string;
  group: string;
  mediaGroup: string;
  typeLabel: string;
  fileType: string;
  filename: string;
  tags: string[];
  detailUrl: string;
  previewUrl: string;
  downloadUrl: string;
  thumbnailUrl: string;
  fileSize: number;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
}

export interface CdcMediaCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  group: string | null;
  fileCount: number;
}

interface Props {
  title?: string;
  subtitle?: string;
  items: CdcMediaItem[];
  categories: CdcMediaCategory[];
  totalFiles: number;
  totalDownloads: number;
  totalSize: number;
  defaultLayout?: "grid" | "list";
  limit?: number;
  showStats?: boolean;
  allowLayoutSwitch?: boolean;
  baseUrl?: string;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

type FileCat = "image" | "video" | "audio" | "pdf" | "word" | "excel" | "powerpoint" | "other";

function getFileCat(mimeType: string = "", filename: string = ""): FileCat {
  const mime = mimeType.toLowerCase();
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";
  if (["mp4", "webm", "avi", "mov", "mkv"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) return "audio";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (["ppt", "pptx"].includes(ext)) return "powerpoint";

  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("word") || mime.includes("document")) return "word";
  if (mime.includes("sheet") || mime.includes("excel") || mime.includes("spreadsheet")) return "excel";
  if (mime.includes("presentation") || mime.includes("powerpoint")) return "powerpoint";
  return "other";
}

function getFileHeroIconInfo(mimeType: string, filename?: string) {
  const cat = getFileCat(mimeType, filename);
  switch (cat) {
    case "video":
      return { label: "Video", icon: Video, bg: "bg-purple-600/90 text-white border-purple-400/40 shadow-purple-500/20", colorClass: "text-violet-500" };
    case "image":
      return { label: "Hình ảnh", icon: ImageIcon, bg: "bg-emerald-600/90 text-white border-emerald-400/40 shadow-emerald-500/20", colorClass: "text-emerald-500" };
    case "pdf":
      return { label: "PDF", icon: FileText, bg: "bg-rose-600/90 text-white border-rose-400/40 shadow-rose-500/20", colorClass: "text-red-500" };
    case "word":
      return { label: "Word", icon: FileEdit, bg: "bg-blue-600/90 text-white border-blue-400/40 shadow-blue-500/20", colorClass: "text-blue-600" };
    case "audio":
      return { label: "Âm thanh", icon: Headphones, bg: "bg-pink-600/90 text-white border-pink-400/40 shadow-pink-500/20", colorClass: "text-pink-500" };
    case "excel":
      return { label: "Excel", icon: FileSpreadsheet, bg: "bg-green-600/90 text-white border-green-400/40 shadow-green-500/20", colorClass: "text-green-600" };
    case "powerpoint":
      return { label: "PowerPoint", icon: Presentation, bg: "bg-orange-600/90 text-white border-orange-400/40 shadow-orange-500/20", colorClass: "text-orange-500" };
    default:
      return { label: "Tài liệu", icon: FileText, bg: "bg-slate-600/90 text-white border-slate-400/40 shadow-slate-500/20", colorClass: "text-slate-500" };
  }
}

const GROUPS = [
  { id: "", name: "Tất cả", icon: LayoutGrid },
  { id: "VIDEO", name: "Thư viện Video", icon: Film },
  { id: "GRAPHICS", name: "Ấn phẩm & Hình ảnh", icon: ImageIcon },
  { id: "AUDIO", name: "Âm thanh & Podcast", icon: Mic },
  { id: "DOCUMENTS", name: "Tài liệu chuyên môn", icon: FileText },
];

const FILE_TYPE_FILTERS = [
  { value: "", label: "Tất cả", icon: LayoutGrid },
  { value: "video", label: "Video", icon: Video },
  { value: "image", label: "Hình ảnh", icon: ImageIcon },
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "audio", label: "Âm thanh", icon: Headphones },
  { value: "word", label: "Word", icon: FileEdit },
];

// ── Kiểu 1: Apple TV Style Media Card (Giống hệt CDCMedia PublicFileList) ──
function AppleTVCard({
  file,
  onTagClick,
}: {
  file: CdcMediaItem;
  onTagClick?: (tag: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const isNew = Date.now() - new Date(file.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  const cat = getFileCat(file.fileType, file.filename);
  const isAudio = cat === "audio";
  const heroIconInfo = getFileHeroIconInfo(file.fileType, file.filename);
  const HeroIcon = heroIconInfo.icon;
  const hasValidThumb = !imgError && Boolean(file.thumbnailUrl) && !isAudio;

  return (
    <div className="group relative flex flex-col rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 overflow-hidden ring-1 ring-black/5">
      {/* 16:9 Apple TV Cinematic Poster Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 block">
        <a
          href={file.detailUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-0 block cursor-pointer"
          aria-label={file.title}
        >
          {hasValidThumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.thumbnailUrl}
              alt={file.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : isAudio ? (
            /* Audio Soundwave Equalizer Poster (Giống CDCMedia) */
            <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-100 via-rose-50 to-indigo-100 transition-colors duration-300">
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-rose-400/30 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-purple-400/30 blur-2xl pointer-events-none" />

              <div className="relative z-10 p-2.5 rounded-2xl bg-white/85 backdrop-blur-md border border-purple-200/80 shadow-xl mb-3 group-hover:scale-110 transition-all duration-300">
                <Headphones className="w-6 h-6 text-purple-600 drop-shadow-md" />
              </div>

              <div className="relative z-10 flex items-center justify-center gap-1.5 h-7 px-4">
                {[35, 70, 95, 55, 85, 45, 90, 100, 65, 80, 50, 75, 40].map((height, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-purple-600 via-pink-500 to-rose-400 shadow-sm"
                    style={{ height: `${height}%`, opacity: 0.9 }}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Minimalist Fallback Poster */
            <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100/90 transition-colors duration-300">
              <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />
              <div className="relative z-10 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xl group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
                <HeroIcon className="w-7 h-7 text-slate-700 drop-shadow-md" />
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        </a>

        {/* Top-Left Category Ribbon */}
        <div className="absolute top-0 left-0 z-10 pointer-events-none">
          <span
            className={clsx(
              "backdrop-blur-md bg-black/60 text-white/95 border-r border-b border-white/20 pl-2.5 pr-3.5 py-1 text-[10px] font-bold tracking-wide uppercase shadow-md inline-flex items-center gap-1.5 select-none",
              "[clip-path:polygon(0%_0%,calc(100%-8px)_0%,100%_50%,calc(100%-8px)_100%,0%_100%)]"
            )}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: file.categoryColor || "#38bdf8" }}
            />
            <span className="truncate max-w-[130px]">{file.category}</span>
          </span>
        </div>

        {/* Top-Right Quick Download & Format Icon */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1 max-w-[55%] pointer-events-auto">
          <div className="flex items-center gap-1">
            {isNew && (
              <span className="backdrop-blur-md bg-rose-600/90 text-white border border-rose-400/40 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-lg animate-pulse tracking-wider">
                MỚI
              </span>
            )}
            <a
              href={file.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full backdrop-blur-md bg-black/60 hover:bg-[#1D78B8] hover:text-white text-white/90 border border-white/20 shadow-md flex items-center justify-center transition-all group-hover:scale-110 active:scale-95 cursor-pointer"
              title="Tải xuống tài liệu"
              aria-label="Tải xuống"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
            <span
              className={clsx(
                "w-7 h-7 rounded-full backdrop-blur-md shadow-md border flex items-center justify-center transition-transform group-hover:scale-110",
                heroIconInfo.bg
              )}
              title={heroIconInfo.label}
            >
              <HeroIcon className="w-3.5 h-3.5" />
            </span>
          </div>

          {file.tags && file.tags.length > 0 && (
            <div className="flex flex-col items-end gap-1 mt-1 -mr-2.5">
              {file.tags.slice(0, 2).map((tagName, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onTagClick?.(tagName);
                  }}
                  className={clsx(
                    "backdrop-blur-md bg-black/60 hover:bg-black/85 text-white/95 border-l border-white/25 text-[9px] font-semibold pl-3.5 pr-2 py-0.5 shadow-md transition-all hover:-translate-x-1 truncate max-w-[125px] select-none text-right cursor-pointer",
                    "[clip-path:polygon(8px_0%,100%_0%,100%_100%,8px_100%,0%_50%)]"
                  )}
                >
                  #{tagName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Floating Stats Inside Thumbnail */}
        <div className="absolute bottom-2 left-0 right-2.5 z-10 flex items-center justify-between pointer-events-none gap-1">
          <div className="flex items-center gap-1 min-w-0">
            <span
              className={clsx(
                "backdrop-blur-md bg-black/55 text-white/90 border-r border-white/20 text-[9px] font-semibold pl-2.5 pr-3.5 py-0.5 shadow-md truncate max-w-[110px] select-none text-left shrink-0",
                "[clip-path:polygon(0%_0%,calc(100%-8px)_0%,100%_50%,calc(100%-8px)_100%,0%_100%)]"
              )}
            >
              {formatDate(file.createdAt)}
            </span>

            {(file.viewCount > 0 || file.downloadCount > 0) && (
              <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/55 text-white/90 border border-white/15 px-1.5 py-0.5 rounded-md text-[9px] font-medium shadow-sm shrink-0">
                {file.viewCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5 text-white/70" /> {file.viewCount}
                  </span>
                )}
                {file.downloadCount > 0 && (
                  <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
                    <Download className="w-2.5 h-2.5 text-emerald-400" /> {file.downloadCount}
                  </span>
                )}
              </div>
            )}
          </div>

          <span className="backdrop-blur-md bg-black/60 text-white/90 text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/10 shadow-sm shrink-0">
            {formatFileSize(file.fileSize)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-center space-y-1">
        <a href={file.detailUrl} target="_blank" rel="noopener noreferrer" className="block">
          <h3
            className="font-bold text-slate-800 text-sm sm:text-[15px] leading-snug line-clamp-1 group-hover:text-[#1D78B8] transition-colors"
            title={file.title}
          >
            {file.title}
          </h3>
        </a>

        {file.description ? (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed" title={file.description}>
            {file.description}
          </p>
        ) : (
          <p className="text-[11px] text-slate-400 italic line-clamp-1">
            Tài liệu truyền thông y tế • {file.typeLabel}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Kiểu 2: Compact 2-Column List Row (Giống hệt CDCMedia TopDownloadedFiles) ──
function CompactListRow({ file, index }: { file: CdcMediaItem; index: number }) {
  const heroInfo = getFileHeroIconInfo(file.fileType, file.filename);
  const HeroIcon = heroInfo.icon;

  return (
    <div className="group p-2.5 sm:p-3 rounded-xl border border-slate-200/70 bg-slate-50/70 hover:bg-white hover:border-[#1D78B8]/50 hover:shadow-sm flex items-center gap-2.5 sm:gap-3 transition-all duration-150 min-w-0">
      {/* Huy hiệu thứ hạng */}
      <span
        className={clsx(
          "w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0 shadow-2xs",
          index === 0
            ? "bg-amber-400 text-slate-950 ring-1 ring-amber-500/30"
            : index === 1
            ? "bg-slate-300 text-slate-800 ring-1 ring-slate-400/20"
            : index === 2
            ? "bg-amber-600 text-white ring-1 ring-amber-700/20"
            : "bg-slate-200/80 text-slate-600"
        )}
      >
        {index + 1}
      </span>

      {/* Icon loại file */}
      <div className="w-8 h-8 rounded-lg bg-white shadow-2xs border border-slate-200/60 flex items-center justify-center shrink-0">
        <HeroIcon className={clsx("w-4 h-4 transition-colors", heroInfo.colorClass)} />
      </div>

      {/* Tiêu đề & chuyên mục */}
      <a
        href={file.detailUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 block"
      >
        <div className="flex items-center gap-1.5">
          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-[#1D78B8] transition-colors">
            {file.title}
          </p>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-[#1D78B8] transition-all shrink-0 hidden sm:inline-block" />
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded text-white font-semibold shadow-2xs shrink-0 truncate max-w-[140px]"
            style={{ backgroundColor: file.categoryColor || "#1D78B8" }}
          >
            {file.category}
          </span>
          <span className="text-[11px] text-slate-400 shrink-0">
            {heroInfo.label} • {formatFileSize(file.fileSize)}
          </span>
          {file.viewCount > 0 && (
            <span className="text-[11px] text-slate-400 inline-flex items-center gap-0.5">
              • <Eye className="w-3 h-3" /> {file.viewCount}
            </span>
          )}
        </div>
      </a>

      {/* Nút tải xuống nhanh */}
      <a
        href={file.downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Tải xuống trực tiếp"
        className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-white bg-white hover:bg-[#1D78B8] px-2.5 py-1.5 rounded-lg shrink-0 border border-slate-200/80 hover:border-[#1D78B8] shadow-2xs transition-colors"
      >
        <Download className="w-3.5 h-3.5 text-emerald-600 group-hover:text-current" />
        <span className="hidden sm:inline">{file.downloadCount > 0 ? file.downloadCount.toLocaleString("vi-VN") : "Tải"}</span>
      </a>
    </div>
  );
}

export function CdcMediaUI({
  title = "Ngân hàng Tài liệu Truyền thông",
  subtitle = "Kho lưu trữ tập trung tài liệu, hình ảnh, video và ấn phẩm phòng chống dịch bệnh CDC Đà Nẵng.",
  items,
  categories,
  totalFiles,
  totalDownloads,
  totalSize,
  defaultLayout = "grid",
  limit = 8,
  showStats = true,
  allowLayoutSwitch = true,
  baseUrl = "https://media.ksbtdanang.vn",
}: Props) {
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">(defaultLayout);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedGroup) {
        if (selectedGroup === "VIDEO" && item.group !== "VIDEO" && item.mediaGroup !== "Video") return false;
        if (selectedGroup === "GRAPHICS" && item.group !== "GRAPHICS" && item.mediaGroup !== "Ấn phẩm & Hình ảnh") return false;
        if (selectedGroup === "AUDIO" && item.group !== "AUDIO" && item.mediaGroup !== "Âm thanh & Podcast") return false;
        if (selectedGroup === "DOCUMENTS" && item.group !== "DOCUMENTS" && item.mediaGroup !== "Tài liệu & Tờ rơi") return false;
      }

      if (typeFilter) {
        const cat = getFileCat(item.fileType, item.filename);
        if (cat !== typeFilter) return false;
      }

      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = (item.description || "").toLowerCase().includes(q);
        const matchCat = (item.category || "").toLowerCase().includes(q);
        const matchTag = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchCat && !matchTag) return false;
      }

      return true;
    });
  }, [items, selectedGroup, typeFilter, query]);

  const displayedItems = filteredItems.slice(0, limit);
  const hasActiveFilters = Boolean(selectedGroup || typeFilter || query.trim());

  const stats = [
    {
      label: "Tài liệu",
      value: totalFiles.toLocaleString("vi-VN"),
      icon: FileArchive,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Chuyên mục",
      value: categories.length || 5,
      icon: FolderOpen,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
    {
      label: "Lượt tải",
      value: totalDownloads.toLocaleString("vi-VN"),
      icon: Download,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Dung lượng",
      value: formatFileSize(totalSize),
      icon: HardDrive,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
  ];

  // Tách chữ cuối cùng trong tiêu đề để tô màu xanh #1D78B8 giống hệt CDCMedia
  const titleWords = title.trim().split(" ");
  const mainTitle = titleWords.length > 2 ? titleWords.slice(0, -2).join(" ") : title;
  const accentTitle = titleWords.length > 2 ? titleWords.slice(-2).join(" ") : "";

  return (
    <div className="w-full space-y-3.5">
      {/* 1. Sleek Hero & Stats Bar (Giống hệt trang chủ CDCMedia) */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#1D78B8]/10 blur-2xl" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#F26A21]/10 blur-2xl" />
        </div>

        <div className="relative px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 text-left">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight flex flex-wrap items-center gap-1.5">
              <span>{mainTitle}</span>
              {accentTitle && <span className="text-[#1D78B8]">{accentTitle}</span>}
            </h2>
            {subtitle && (
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {showStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:flex md:flex-wrap md:items-center gap-2 sm:gap-2.5 w-full md:w-auto shrink-0 pt-1 md:pt-0">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className={`flex items-center justify-center sm:justify-start gap-2.5 px-3 py-2 rounded-xl ${s.bg} border ${s.border} shadow-2xs w-full md:w-auto`}
                >
                  <div className="p-1.5 rounded-lg bg-white/90 shadow-2xs shrink-0 border border-black/5">
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="flex flex-col items-center sm:items-start justify-center min-w-[48px]">
                    <span className={`text-sm sm:text-base md:text-lg font-black ${s.color} tabular-nums leading-tight`}>
                      {s.value}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mt-0.5">
                      {s.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Content Container (Giống hệt khung PublicFileList của CDCMedia) */}
      <div className="w-full bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-3 sm:p-6 border border-slate-200/80 relative z-10 space-y-4">
        {/* Thanh Phân hệ (Groups) + Nút chuyển đổi Kiểu 1 / Kiểu 2 */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {GROUPS.map((grp) => {
              const IconComponent = grp.icon;
              const isActive = selectedGroup === grp.id;
              return (
                <button
                  key={grp.id || "all"}
                  type="button"
                  onClick={() => setSelectedGroup(grp.id)}
                  className={clsx(
                    "relative px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 select-none cursor-pointer",
                    isActive
                      ? "text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="cdcmedia-active-group"
                      className="absolute inset-0 bg-gradient-to-r from-[#1D78B8] to-[#0d5485] rounded-xl sm:rounded-full shadow-md"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <IconComponent className={clsx("w-3.5 h-3.5 sm:w-4 sm:h-4", isActive ? "text-white" : "text-[#1D78B8]")} />
                    <span>{grp.name}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chuyển đổi Kiểu 1 (Lưới thẻ) & Kiểu 2 (Danh sách 2 cột) */}
          {allowLayoutSwitch && (
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setLayoutMode("grid")}
                className={clsx(
                  "px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                  layoutMode === "grid"
                    ? "bg-white text-[#1D78B8] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                )}
                title="Kiểu 1: Lưới Thẻ có ảnh Thumbnail"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Lưới thẻ</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("list")}
                className={clsx(
                  "px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                  layoutMode === "list"
                    ? "bg-white text-[#1D78B8] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                )}
                title="Kiểu 2: Danh sách 2 cột rút gọn"
              >
                <List className="w-3.5 h-3.5" />
                <span>Danh sách gọn</span>
              </button>
            </div>
          )}
        </div>

        {/* Thanh Tìm kiếm & Lọc Định dạng (Unified Search & Format Toolbar) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 py-2.5 border-y border-slate-100">
          <div className="relative w-full lg:w-72 xl:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm tài liệu, video, infographic…"
              className="w-full h-9 pl-9 pr-8 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-[#1D78B8] focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 flex-1 justify-start lg:justify-end">
            {FILE_TYPE_FILTERS.map((f) => {
              const active = typeFilter === f.value;
              const Icon = f.icon;
              return (
                <button
                  key={f.value || "all-fmt"}
                  type="button"
                  onClick={() => setTypeFilter(f.value)}
                  className={clsx(
                    "px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border select-none cursor-pointer",
                    active
                      ? "bg-[#1D78B8] text-white border-[#1D78B8] shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className={clsx("w-3.5 h-3.5", active ? "text-white" : "text-slate-500")} />
                  <span>{f.label}</span>
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSelectedGroup("");
                  setTypeFilter("");
                  setQuery("");
                }}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Hiển thị Danh sách Tài liệu theo Kiểu 1 (Grid) hoặc Kiểu 2 (List) */}
        {displayedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-slate-500 gap-2.5 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <Search className="w-10 h-10 text-slate-300" />
            <p className="font-bold text-sm text-slate-700">
              Không tìm thấy tài liệu phù hợp {query ? `với "${query}"` : ""}
            </p>
            <a
              href={`${baseUrl}/requests`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1D78B8] to-blue-600 text-white text-xs font-bold shadow-sm hover:opacity-95 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Yêu cầu CDC cung cấp tài liệu này</span>
            </a>
          </div>
        ) : layoutMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedItems.map((file) => (
              <AppleTVCard
                key={file.id}
                file={file}
                onTagClick={(tag) => setQuery(tag)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {displayedItems.map((file, idx) => (
              <CompactListRow key={file.id} file={file} index={idx} />
            ))}
          </div>
        )}

        {/* Footer CTA đồng bộ CDCMedia */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Đang hiển thị <strong className="text-slate-800">{displayedItems.length}</strong> /{" "}
            <strong className="text-slate-800">{totalFiles.toLocaleString("vi-VN")}</strong> tài liệu truyền thông y tế
          </p>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
            <a
              href={`${baseUrl}/requests`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-[#1D78B8]" />
              <span>Yêu cầu cung cấp tài liệu</span>
            </a>

            <a
              href={baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1D78B8] to-[#0d5485] hover:opacity-95 text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>Xem toàn bộ Ngân hàng Tài liệu ({totalFiles}+)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
