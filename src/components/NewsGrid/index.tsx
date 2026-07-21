// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Eye, Calendar } from 'lucide-react';
import styles from './NewsGrid.module.css';
import { NewsGridSliderClient } from './NewsGridSliderClient';

interface NewsGridProps {
  categoryId?: string | number;
  categoryName?: string;
  categorySlug?: string;
  limitOverride?: number;
  layoutOverride?: string;
  excludeId?: string | number;
}

async function getLatestArticles(limit: number, categoryId?: string | number, excludeId?: string | number) {
  try {
    const payload = await getPayload({ config: configPromise });
    const query: any = {
      collection: 'articles',
      sort: '-createdAt',
      limit: limit,
      depth: 1,
      where: {
        and: []
      }
    };
    
    if (categoryId) {
        query.where.and.push({
          or: [
            { category: { equals: categoryId } },
            { additionalCategories: { equals: categoryId } }
          ]
        });
    }
    
    if (excludeId) {
        query.where.and.push({ id: { not_equals: excludeId } });
    }
    
    // Nếu mảng rỗng thì xoá điều kiện where đi
    if (query.where.and.length === 0) {
        delete query.where;
    }
    
    const { docs } = await payload.find(query);
    return docs;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

async function getNewsSettings() {
  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: 'site-settings' });
    return {
      limit: settings?.homeNewsLimit || 10,
      desktopCols: settings?.homeNewsColumnsDesktop || 5,
      mobileCols: settings?.homeNewsColumnsMobile || 2,
      homeNewsLayout: settings?.homeNewsLayout || 'grid',
    };
  } catch(e) {
    return { limit: 10, desktopCols: 5, mobileCols: 2, homeNewsLayout: 'grid' };
  }
}

// Helper: kiểm tra URL nội bộ
function isInternalUrl(url: string) {
  if (!url) return false;
  return url.startsWith('/') || url.startsWith('./') || url.includes('ecdc.vnos.org');
}

export const NewsGrid = async ({ categoryId, categoryName, categorySlug, limitOverride, layoutOverride, excludeId }: NewsGridProps) => {
  const { limit: defaultRows, desktopCols, mobileCols, homeNewsLayout } = await getNewsSettings();
  const actualLimit = limitOverride || defaultRows || 8;
  const articles = await getLatestArticles(actualLimit, categoryId, excludeId);
  
  const title = categoryName ? categoryName.toUpperCase() : 'THÔNG TIN MỚI NHẤT';

  const layout = layoutOverride || (categoryId ? 'grid' : homeNewsLayout);

  if (!articles || articles.length === 0) {
    return (
      <section className={styles.newsSection}>
        <div className="container">
          <div className="p-4 sm:p-5 bg-white/70 border border-gray-200/50 rounded-2xl backdrop-blur-sm shadow-sm mb-6">
            <div className="global-section-header">
              <h2 className="global-section-title">
                {title}
              </h2>
            </div>
            <p>Chưa có bài viết nào.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.newsSection}>
      <div className="container">
        <div className="p-4 sm:p-5 bg-white/70 border border-gray-200/50 rounded-2xl backdrop-blur-sm shadow-sm mb-6">
          <div className="global-section-header">
          <h2 className="global-section-title">
            {title}
          </h2>
          {categorySlug && (
            <Link href={`/chuyen-muc/${categorySlug}`} className={styles.viewMore}>
              Xem thêm &raquo;
            </Link>
          )}
        </div>
        
        {layout === 'slider' ? (
          <NewsGridSliderClient 
            articles={articles} 
            desktopCols={desktopCols} 
            mobileCols={mobileCols} 
          />
        ) : layout === 'list' ? (
          <div className={styles.listContainer}>
            {articles.map((article: any) => {
              const mediaUrl = article.image?.url || '/logo.png';
              const catName = article.category?.name || 'Tin tức';
              return (
                <article key={article.id} className={styles.listItem}>
                  <div className={styles.listImage}>
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      {/* Phase 2: next/image — mobile nhận ảnh nhỏ + WebP tự động */}
                      <Image
                        src={mediaUrl}
                        alt={article.title}
                        width={320}
                        height={200}
                        sizes="(max-width: 640px) 40vw, 200px"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        quality={60}
                        unoptimized={!isInternalUrl(mediaUrl)}
                      />
                    </Link>
                  </div>
                  <div className={styles.listBody}>
                    <h3 className={styles.listTitle}>
                      <Link href={`/bai-viet/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    {article.description && (
                      <p className={styles.listExcerpt}>{article.description}</p>
                    )}
                    <div className={styles.listMeta}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> 
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> 
                        {article.views || 0}
                      </span>
                      <span className="ml-auto text-[var(--primary)] font-semibold text-xs">{catName}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : layout === 'compact' ? (
          <div className={styles.compactContainer}>
            {articles.map((article: any) => {
              return (
                <div key={article.id} className={styles.compactItem}>
                  <div className={styles.compactTitle}>
                    <span className="text-[var(--primary)] mr-1.5">•</span>
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      {article.title}
                    </Link>
                  </div>
                  <span className={styles.compactDate}>
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              );
            })}
          </div>
        ) : layout === 'featured' ? (
          (() => {
            const featuredArticle = articles[0];
            const sideArticles = articles.slice(1);
            const featuredMediaUrl = featuredArticle.image?.url || '/logo.png';
            const featuredCatName = featuredArticle.category?.name || 'Tin tức';

            return (
              <div className={styles.featuredContainer}>
                {/* Left side: Big Featured Card */}
                <div className={styles.bigCard}>
                  <div className={styles.bigImageHolder}>
                    <Link href={`/bai-viet/${featuredArticle.slug || featuredArticle.id}`}>
                      {/* Phase 2: priority + WebP — ảnh đầu tiên Above The Fold */}
                      <Image
                        src={featuredMediaUrl}
                        alt={featuredArticle.title}
                        width={720}
                        height={405}
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="w-full h-full object-cover"
                        priority
                        quality={60}
                        unoptimized={!isInternalUrl(featuredMediaUrl)}
                      />
                    </Link>
                    <span className={styles.catBadge}>{featuredCatName}</span>
                  </div>
                  <div className={styles.bigBody}>
                    <h3 className={styles.bigTitle}>
                      <Link href={`/bai-viet/${featuredArticle.slug || featuredArticle.id}`}>
                        {featuredArticle.title}
                      </Link>
                    </h3>
                    {featuredArticle.description && (
                      <p className={styles.bigExcerpt}>{featuredArticle.description}</p>
                    )}
                    <div className={styles.bigMeta}>
                      <span className="flex items-center gap-2">
                        <Calendar size={12} /> 
                        {new Date(featuredArticle.publishedAt || featuredArticle.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-2">
                        <Eye size={12} /> 
                        {featuredArticle.views || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: List of side articles */}
                <div className={styles.sideList}>
                  {sideArticles.map((article: any) => {
                    const sideMediaUrl = article.image?.url || '/logo.png';
                    const sideCatName = article.category?.name || 'Tin tức';

                    return (
                      <article key={article.id} className={styles.sideItem}>
                        <div className={styles.sideImage}>
                          <Link href={`/bai-viet/${article.slug || article.id}`}>
                            <Image
                              src={sideMediaUrl}
                              alt={article.title}
                              width={160}
                              height={100}
                              sizes="(max-width: 640px) 30vw, 160px"
                              className="w-full h-full object-cover"
                              loading="lazy"
                              quality={60}
                              unoptimized={!isInternalUrl(sideMediaUrl)}
                            />
                          </Link>
                        </div>
                        <div className={styles.sideBody}>
                          <h4 className={styles.sideTitle}>
                            <Link href={`/bai-viet/${article.slug || article.id}`}>
                              {article.title}
                            </Link>
                          </h4>
                          <div className={styles.sideMeta}>
                            <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span className="text-[var(--primary)]">{sideCatName}</span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })()
        ) : (
          <div 
            className={styles.grid} 
            style={{ 
              '--desktop-cols': desktopCols,
              '--mobile-cols': mobileCols
            } as React.CSSProperties}
          >
            {articles.map((article: any) => {
              const mediaUrl = article.image?.url || '/logo.png';
              const catName = article.category?.name || 'Tin tức';
              
              return (
                <article key={article.id} className={styles.card}>
                  <div className={styles.imageHolder}>
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      {/* Phase 2: next/image — mobile nhận ảnh nhỏ + WebP tự động */}
                      <Image
                        src={mediaUrl}
                        alt={article.title}
                        width={400}
                        height={240}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        quality={60}
                        unoptimized={!isInternalUrl(mediaUrl)}
                      />
                    </Link>
                    <span className={styles.catBadge}>{catName}</span>
                  </div>
                  <div className={styles.body}>
                    <h3 className={styles.title}>
                      <Link href={`/bai-viet/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <div className={styles.meta}>
                      <span className="flex items-center gap-2"><Calendar size={12}/> {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="flex items-center gap-2"><Eye size={12}/> {article.views || 0}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </section>
  );
};
