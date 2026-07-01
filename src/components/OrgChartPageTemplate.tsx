// @ts-nocheck
import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { OrgChart } from '@/components/OrgChart';
import { OrgAccordion } from '@/components/OrgAccordion';
import { OrgCardGrid } from '@/components/OrgCardGrid';
import { OrgSimpleTable } from '@/components/OrgSimpleTable';
import { OrgTabs } from '@/components/OrgTabs';

export async function OrgChartPageTemplate({ slug }: { slug: string }) {
  const payload = await getPayload({ config: configPromise });

  const orgUnitsRes = await payload.find({
    collection: 'org-units',
    sort: 'order',
    limit: 100,
    depth: 1,
  });

  let themeColors: Record<string, string> = {};
  let orgLayout = 'chart_accordion';
  try {
    const themeSettings = await payload.findGlobal({ slug: 'site-settings' }) as any;
    themeColors = (themeSettings?.theme?.orgColors as Record<string, string>) || {};
    if (themeSettings?.theme?.orgLayout) {
      orgLayout = themeSettings.theme.orgLayout as string;
    }
  } catch {
    // Dùng màu mặc định nếu chưa có dữ liệu global
  }

  const orgUnits = orgUnitsRes.docs;

  // Render breadcrumb components based on the dynamic slug
  const slugParts = slug.split('/');
  const breadcrumbItems = slugParts.map((part, index) => {
    const isLast = index === slugParts.length - 1;
    const title = part === 'gioi-thieu' ? 'Giới thiệu' : part === 'co-cau-to-chuc' ? 'Cơ cấu tổ chức' : part;
    return (
      <React.Fragment key={index}>
        <span aria-hidden="true">›</span>
        {isLast ? (
          <span aria-current="page">{title}</span>
        ) : (
          <a href={`/${slugParts.slice(0, index + 1).join('/')}`}>{title}</a>
        )}
      </React.Fragment>
    );
  });

  return (
    <main className="co-cau-to-chuc-page">
      <div className="container org-content">
        <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
          <a href="/">Trang chủ</a>
          {breadcrumbItems}
        </nav>
        {orgLayout === 'chart_accordion' && (
          <>
            <section className="org-chart-section" aria-labelledby="org-chart-heading">
              <h2 id="org-chart-heading" className="section-title">
                <span className="section-icon" aria-hidden="true">🏛️</span>
                Sơ đồ Tổ chức
              </h2>
              <OrgChart units={orgUnits as any[]} themeColors={themeColors} />
            </section>

            <div className="section-divider" aria-hidden="true">
              <span>Nhân sự các Phòng / Khoa</span>
            </div>

            <section className="org-accordion-section" aria-labelledby="org-accordion-heading">
              <h2 id="org-accordion-heading" className="section-title">
                <span className="section-icon" aria-hidden="true">👥</span>
                Danh sách Nhân sự
              </h2>
              <OrgAccordion units={orgUnits as any[]} themeColors={themeColors} />
            </section>
          </>
        )}

        {orgLayout === 'card_grid' && (
          <section className="org-card-grid-section">
            <h2 className="section-title">
              <span className="section-icon" aria-hidden="true">📁</span>
              Các Đơn vị trực thuộc
            </h2>
            <OrgCardGrid units={orgUnits as any[]} themeColors={themeColors} />
          </section>
        )}

        {orgLayout === 'simple_table' && (
          <section className="org-simple-table-section">
            <h2 className="section-title">
              <span className="section-icon" aria-hidden="true">📋</span>
              Danh sách Đơn vị
            </h2>
            <OrgSimpleTable units={orgUnits as any[]} themeColors={themeColors} />
          </section>
        )}

        {orgLayout === 'tabs' && (
          <section className="org-tabs-section">
            <h2 className="section-title">
              <span className="section-icon" aria-hidden="true">🗂️</span>
              Nhân sự theo nhóm
            </h2>
            <OrgTabs units={orgUnits as any[]} themeColors={themeColors} />
          </section>
        )}

        {orgLayout === 'chart_only' && (
          <section className="org-chart-section">
            <h2 className="section-title">
              <span className="section-icon" aria-hidden="true">🌳</span>
              Sơ đồ Tổ chức
            </h2>
            <OrgChart units={orgUnits as any[]} themeColors={themeColors} />
          </section>
        )}
      </div>

      <style>{`
        .co-cau-to-chuc-page {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }

        .breadcrumb a {
          color: #0ea5e9;
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumb a:hover {
          color: #0284c7;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .org-content {
          padding-top: 1.5rem;
          padding-bottom: 2rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 1.25rem;
          letter-spacing: -0.01em;
        }

        .section-icon {
          font-size: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #f1f5f9;
          border-radius: 10px;
          color: #0ea5e9;
        }

        .org-chart-section, .org-card-grid-section, .org-simple-table-section, .org-tabs-section, .org-accordion-section {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 1.25rem;
          padding: 1.5rem;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.02);
          margin-bottom: 1.5rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .section-divider {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin: 1.5rem 0;
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .section-divider::before,
        .section-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        
        /* Utility classes for nice scrollbars */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </main>
  );
}
