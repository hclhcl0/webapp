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
  topics: TopicItem[];
  activeSlug?: string;       // slug của chủ đề mẹ đang xem
  activeSubSlug?: string;    // slug của chủ đề con đang xem
}

export function HealthSidebar({ topics, activeSlug, activeSubSlug }: Props) {
  // Trạng thái mở/đóng menu trên mobile
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-mở accordion của chủ đề mẹ đang active
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (activeSlug) s.add(activeSlug);
    return s;
  });

  const toggle = (slug: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden lg:sticky top-6">
        {/* Nút bật/tắt menu trên di động (chỉ hiện trên màn hình nhỏ) */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden w-full px-4 py-3 bg-white flex items-center justify-between font-bold text-gray-700 focus:outline-none"
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4 text-gov-primary" />
            Lọc chủ đề
          </span>
          {isMobileOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Nội dung Sidebar */}
        <div className={`p-3 max-h-[calc(100vh-8rem)] overflow-y-auto ${isMobileOpen ? 'block border-t border-gray-100' : 'hidden lg:block'}`}>
          {/* Tất cả chủ đề */}
          <Link
            href="/suc-khoe"
            className={`flex items-center justify-between px-4 py-3 mb-2 rounded-lg text-sm font-semibold transition-all ${
              !activeSlug
                ? 'bg-gov-primary text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>Tất cả chủ đề</span>
            {!activeSlug && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
          </Link>

          {/* Danh sách chủ đề */}
          <div className="space-y-1">
            {topics.map((topic) => {
              const isActive = activeSlug === topic.slug;
              const hasChildren = topic.children && topic.children.length > 0;
              const isExpanded = expanded.has(topic.slug);

              return (
                <div key={topic.id} className="flex flex-col">
                  {/* Chủ đề mẹ */}
                  <div
                    className={`flex items-center rounded-lg text-sm font-medium transition-all ${
                      isActive && !activeSubSlug
                        ? 'bg-teal-50 text-gov-primary border-l-4 border-gov-primary shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent'
                    }`}
                  >
                    <Link
                      href={`/suc-khoe/${topic.slug}`}
                      className="flex-grow px-3 py-3 leading-snug line-clamp-2"
                    >
                      {topic.name}
                    </Link>

                    {/* Nút toggle accordion nếu có con */}
                    {hasChildren && (
                      <button
                        onClick={(e) => { e.preventDefault(); toggle(topic.slug); }}
                        className="px-3 py-3 text-gray-400 hover:text-gov-primary flex-shrink-0 rounded-r-lg"
                        aria-label="Mở rộng"
                      >
                        {isExpanded
                          ? <ChevronDown className="w-4 h-4 transition-transform" />
                          : <ChevronRight className="w-4 h-4 transition-transform" />}
                      </button>
                    )}
                  </div>

                  {/* Chủ đề con (accordion) */}
                  {hasChildren && isExpanded && (
                    <div className="mt-1 ml-4 pl-3 border-l-2 border-gray-100 space-y-1 py-1">
                      {topic.children!.map((child) => {
                        const isChildActive = activeSubSlug === child.slug;
                        return (
                          <Link
                            key={child.id}
                            href={`/suc-khoe/${topic.slug}/${child.slug}`}
                            className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                              isChildActive
                                ? 'bg-gov-primary text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gov-primary'
                            }`}
                          >
                            <span className="line-clamp-2 leading-snug">{child.name}</span>
                            {isChildActive && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {topics.length === 0 && (
              <div className="px-4 py-8 text-sm text-gray-400 text-center">
                Chưa có chủ đề nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
