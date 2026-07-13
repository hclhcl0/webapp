'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, List } from 'lucide-react';

interface CategoryItem {
  id: string | number;
  name: string;
  slug: string;
}

interface Props {
  categories: CategoryItem[];
  activeSlug?: string;
}

export function ServiceSidebar({ categories, activeSlug }: Props) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden lg:sticky top-6">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden w-full px-4 py-3 bg-white flex items-center justify-between font-bold text-gray-700 focus:outline-none"
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4 text-gov-primary" />
            Lọc nhóm dịch vụ
          </span>
          {isMobileOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className={`p-2 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar ${isMobileOpen ? 'block border-t border-gray-100' : 'hidden lg:block'}`}>
          <Link
            href="/dich-vu/tat-ca"
            className={`flex items-center justify-between px-3 py-2.5 mb-1 rounded-md text-[13.5px] transition-all ${
              !activeSlug
                ? 'bg-gov-primary text-white font-bold shadow-md'
                : 'text-gray-900 font-semibold hover:bg-gray-200'
            }`}
          >
            <span>Tất cả dịch vụ</span>
            {!activeSlug && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
          </Link>

          <div className="space-y-0.5 mt-2">
            {categories.map((cat) => {
              const isActive = activeSlug === cat.slug;

              return (
                <div key={cat.id} className="flex flex-col">
                  <div
                    className={`flex items-center rounded-md text-[13.5px] transition-all group ${
                      isActive
                        ? 'bg-primary-50 text-gov-primary font-bold'
                        : 'text-gray-800 font-semibold hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    <Link
                      href={`/dich-vu/tat-ca?category=${cat.slug}`}
                      className="flex-grow px-3 py-2 leading-tight relative"
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 bg-gov-primary rounded-r-full" />
                      )}
                      {cat.name}
                    </Link>
                  </div>
                </div>
              );
            })}

            {categories.length === 0 && (
              <div className="px-3 py-6 text-xs text-gray-400 text-center border border-dashed border-gray-200 rounded-md">
                Chưa có nhóm dịch vụ nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
