import React from 'react';
import Link from 'next/link';
import { ChevronRight, Filter } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { NewsGrid } from '@/components/NewsGrid';
import { CategoryCover } from '@/components/CategoryCover';

interface CategoryTemplateProps {
  category: any;
  slugArray: string[];
}

export async function CategoryTemplate({ category, slugArray }: CategoryTemplateProps) {
  const payload = await getPayload({ config: configPromise });

  // 1. Tìm các chuyên mục có liên quan (để làm Sidebar)
  // Nếu category hiện tại CÓ parent, ta sẽ hiện danh sách các anh chị em (cùng parent).
  // Nếu category KHÔNG CÓ parent (category gốc), ta sẽ hiện danh sách các con của nó.
  let sidebarParentId = category.parent ? (typeof category.parent === 'object' ? category.parent.id : category.parent) : category.id;
  
  const { docs: relatedCategories } = await payload.find({
    collection: 'categories',
    where: { parent: { equals: sidebarParentId } },
    sort: 'orderNum',
    limit: 50,
  });

  // Tên nhóm sidebar
  let sidebarTitle = 'Chuyên mục';
  if (category.parent) {
    const parentObj = typeof category.parent === 'object' ? category.parent : null;
    if (parentObj) {
      sidebarTitle = parentObj.name;
    } else {
      sidebarTitle = 'Chuyên mục liên quan';
    }
  } else {
    sidebarTitle = category.name;
  }

  // Cover Image
  const coverImage = category.coverImage;
  const coverUrl = coverImage ? (typeof coverImage === 'object' ? coverImage.url : null) : null;
  const themeColor = category.color || '#0056b3';

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-12">
      {/* 2. Breadcrumbs */}
      <div className="container mx-auto px-4 max-w-7xl">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 my-6 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-[#0056b3] transition-colors flex-shrink-0">Trang chủ</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          {category.parent && typeof category.parent === 'object' && (
            <>
              <Link href={`/${category.parent.slug}`} className="hover:text-[#0056b3] transition-colors flex-shrink-0">
                {category.parent.name}
              </Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </>
          )}
          <span className="text-gray-900 font-medium flex-shrink-0" style={{ color: themeColor }}>{category.name}</span>
        </nav>
      </div>

      {/* 3. Main Layout */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Lưới bài viết (Cột chính) */}
          <div className="flex-1 min-w-0">
            {/* Ảnh bìa & Tiêu đề */}
            <CategoryCover category={category} />
            
            {!coverUrl && (
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ color: themeColor }}>
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-gray-600 mt-2 max-w-3xl">{category.description}</p>
                )}
              </div>
            )}

            <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span>Danh sách bài viết</span>
              </h2>
            </div>
            
            <NewsGrid 
              categoryId={category.id} 
              categoryName={category.name} 
              categorySlug={category.slug}
              layoutOverride="grid" 
            />
          </div>

          {/* Sidebar */}
          {relatedCategories && relatedCategories.length > 0 && (
            <div className="w-full lg:w-80 flex-shrink-0 order-first lg:order-last">
              <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">
                    {sidebarTitle}
                  </h3>
                </div>
                <div className="p-3">
                  <ul className="space-y-1">
                    {category.parent && (
                      <li>
                        <Link 
                          href={`/${typeof category.parent === 'object' ? category.parent.slug : ''}`}
                          className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <span className="font-medium">Tất cả {sidebarTitle}</span>
                        </Link>
                      </li>
                    )}
                    
                    {relatedCategories.map((cat: any) => {
                      const isActive = cat.id === category.id;
                      const href = `/${cat.slug}`;
                      
                      return (
                        <li key={cat.id}>
                          <Link 
                            href={href}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                              isActive 
                                ? 'bg-blue-50 text-[#0056b3] font-semibold' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              {cat.icon && <span>{cat.icon}</span>}
                              {cat.name}
                            </span>
                            {isActive && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#0056b3]" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
