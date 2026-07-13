'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, List } from 'lucide-react';

interface TopicItem {
  id: number | string;
  name: string;
  slug: string;
  children?: TopicItem[];
}

interface Props {
  topics: TopicItem[];
  activeSlug?: string;
  activeSubSlug?: string;
  children?: React.ReactNode;
}

export function ServiceSidebar({ topics, activeSlug, activeSubSlug, children }: Props) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (activeSlug) s.add(activeSlug);
    return s;
  });

  const toggle = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6 lg:sticky top-6 self-start">
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        {/* Nút bật/tắt menu trên di động */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden w-full px-4 py-3 bg-white flex items-center justify-between font-bold text-gray-700 focus:outline-none"
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4 text-gov-primary" />
            Lọc chuyên mục
          </span>
          {isMobileOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Nội dung Sidebar */}
        <div
          className={`p-2 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar ${
            isMobileOpen ? 'block border-t border-gray-100' : 'hidden lg:block'
          }`}
        >
          {/* Tất cả */}
          <Link
            href="/dich-vu"
            className={`flex items-center justify-between px-3 py-2.5 mb-1 rounded-md text-[13.5px] transition-all ${
              !activeSlug
                ? 'bg-gov-primary text-white font-bold shadow-md'
                : 'text-gray-900 font-semibold hover:bg-gray-200'
            }`}
          >
            <span>Tất cả chuyên mục</span>
            {!activeSlug && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
          </Link>

          {/* Danh sách chuyên mục */}
          <div className="space-y-0.5 mt-2">
            {topics.map((topic) => {
              const isActive = activeSlug === topic.slug;
              const hasChildren = topic.children && topic.children.length > 0;
              const isExpanded = expanded.has(topic.slug);

              return (
                <div key={topic.id} className="flex flex-col">
                  {/* Chuyên mục cấp 1 */}
                  <div
                    className={`flex items-center rounded-md text-[13.5px] transition-all group ${
                      isActive && !activeSubSlug
                        ? 'bg-primary-50 text-gov-primary font-bold'
                        : 'text-gray-800 font-semibold hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    <Link
                      href={`/dich-vu?topic=${topic.slug}`}
                      className="flex-grow px-3 py-2 leading-tight relative"
                    >
                      {isActive && !activeSubSlug && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 bg-gov-primary rounded-r-full" />
                      )}
                      {topic.name}
                    </Link>

                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggle(topic.slug);
                        }}
                        className={`px-2 py-2 flex-shrink-0 rounded-r-md transition-colors ${
                          isActive && !activeSubSlug
                            ? 'text-gov-primary hover:bg-primary-100/50'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-300'
                        }`}
                        aria-label="Mở rộng"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Chuyên mục cấp 2 */}
                  {hasChildren && isExpanded && (
                    <div className="mt-0.5 ml-4 pl-2 border-l border-gray-100/60 space-y-0.5 py-0.5">
                      {topic.children!.map((child) => {
                        const isChildActive = activeSubSlug === child.slug;
                        return (
                          <Link
                            key={child.id}
                            href={`/dich-vu?topic=${topic.slug}&subtopic=${child.slug}`}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs transition-all relative ${
                              isChildActive
                                ? 'text-gov-primary font-bold bg-primary-50/50'
                                : 'text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-200'
                            }`}
                          >
                            <span className="line-clamp-2 leading-tight">{child.name}</span>
                            {isChildActive && (
                              <span className="absolute left-[-9px] top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-gov-primary" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {topics.length === 0 && (
              <div className="px-3 py-6 text-xs text-gray-400 text-center border border-dashed border-gray-200 rounded-md">
                Chưa có chuyên mục nào.
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
