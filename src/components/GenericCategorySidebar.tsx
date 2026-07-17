'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, List } from 'lucide-react';

interface TopicItem {
  id: number;
  name: string;
  slug: string;
  children?: TopicItem[];
}

interface Props {
  basePath: string;          // Đường dẫn cơ sở, ví dụ: "/tin-tuc-su-kien"
  rootName: string;          // Tên chuyên mục gốc
  topics: TopicItem[];
  activeSlug?: string;       // slug của chủ đề mẹ đang xem
  activeSubSlug?: string;    // slug của chủ đề con đang xem
  children?: React.ReactNode;
}

export function GenericCategorySidebar({ basePath, rootName, topics, activeSlug, activeSubSlug, children }: Props) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // expanded: kết hợp cả hover + active. Active luôn được giữ mở.
  const [hovered, setHovered] = useState<string | null>(null);

  // Chủ đề nào sẽ hiện children: đang hover HOẶC đang active
  const isOpen = (slug: string) => hovered === slug || activeSlug === slug;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6 lg:sticky top-6 self-start">
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        {/* Header title sidebar */}
        <div className="bg-gov-primary px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold text-sm uppercase tracking-wide truncate">{rootName}</h2>
          {/* Nút bật/tắt menu trên di động */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden text-white/80 hover:text-white focus:outline-none ml-2"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <ChevronDown className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>
        </div>

        {/* Nội dung Sidebar */}
        <div className={`p-2 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
          {/* Tất cả chủ đề */}
          <Link
            href={basePath}
            className={`flex items-center justify-between px-3 py-2.5 mb-1 rounded-md text-[13.5px] transition-all ${
              !activeSlug
                ? 'bg-gov-primary text-white font-bold shadow-md'
                : 'text-gray-900 font-semibold hover:bg-gray-200'
            }`}
          >
            <span>Tất cả {rootName}</span>
            {!activeSlug && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
          </Link>

          {/* Danh sách chủ đề */}
          <div className="space-y-0.5 mt-2">
            {topics.map((topic) => {
              const isActive = activeSlug === topic.slug;
              const hasChildren = topic.children && topic.children.length > 0;
              const open = isOpen(topic.slug);

              return (
                <div
                  key={topic.id}
                  className="flex flex-col"
                  onMouseEnter={() => hasChildren && setHovered(topic.slug)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Chủ đề mẹ */}
                  <div
                    className={`flex items-center rounded-md text-[13.5px] transition-all ${
                      isActive && !activeSubSlug
                        ? 'bg-primary-50 text-gov-primary font-bold'
                        : 'text-gray-800 font-semibold hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    <Link
                      href={`${basePath}/${topic.slug}`}
                      className="flex-grow px-3 py-2 leading-tight relative"
                    >
                      {isActive && !activeSubSlug && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 bg-gov-primary rounded-r-full" />
                      )}
                      {topic.name}
                    </Link>

                    {/* Mũi tên chỉ trạng thái mở/đóng (không phải nút click nữa) */}
                    {hasChildren && (
                      <span
                        className={`px-2 py-2 flex-shrink-0 transition-colors ${
                          isActive && !activeSubSlug ? 'text-gov-primary' : 'text-gray-400'
                        }`}
                      >
                        {open
                          ? <ChevronDown className="w-3.5 h-3.5" />
                          : <ChevronRight className="w-3.5 h-3.5" />}
                      </span>
                    )}
                  </div>

                  {/* Chủ đề con — hiện khi hover hoặc active */}
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${
                      open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="mt-0.5 ml-4 pl-2 border-l border-gray-200 space-y-0.5 py-0.5">
                      {(topic.children || []).map((child) => {
                        const isChildActive = activeSubSlug === child.slug;
                        return (
                          <Link
                            key={child.id}
                            href={`${basePath}/${topic.slug}/${child.slug}`}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs transition-all relative ${
                              isChildActive
                                ? 'text-gov-primary font-bold bg-primary-50/50'
                                : 'text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            {isChildActive && (
                              <span className="absolute left-[-9px] top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-gov-primary" />
                            )}
                            <ChevronRight className="w-3 h-3 flex-shrink-0 text-gray-400" />
                            <span className="line-clamp-2 leading-tight">{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {topics.length === 0 && (
              <div className="px-3 py-6 text-xs text-gray-400 text-center border border-dashed border-gray-200 rounded-md">
                Chưa có chủ đề nào.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vị trí chèn Sidebar Banners */}
      {children}
    </aside>
  );
}
