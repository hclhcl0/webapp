import React from 'react';
import Link from 'next/link';
import {
  ArrowRight, HeartPulse, Search,
  Stethoscope, Activity, Clock, Phone, ChevronRight, HelpCircle
} from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const revalidate = 60;

async function getLandingData() {
  try {
    const payload = await getPayload({ config: configPromise });

    const landingConfig = await payload.findGlobal({ slug: 'servicesLanding' as any });

    const categoriesData = await (payload.find as any)({
      collection: 'serviceCategories',
      sort: 'order',
      limit: 100,
    });

    const servicesData = await (payload.find as any)({
      collection: 'services',
      where: { status: { equals: 'active' } },
      sort: '-createdAt',
      limit: 100,
    });

    return {
      config: landingConfig,
      categories: categoriesData.docs,
      services: servicesData.docs,
    };
  } catch (err) {
    console.error('Failed to fetch landing data:', err);
    return { config: null, categories: [], services: [] };
  }
}

const ICON_MAP: Record<string, React.ElementType> = {
  Stethoscope,
  Activity,
  Clock,
  HeartPulse,
};

export default async function ServicesLandingPage() {
  const { config, categories, services } = await getLandingData();

  const heroTitle = config?.hero?.title || 'Dịch vụ y tế - Sản phẩm';
  const heroSubtitle = config?.hero?.subtitle || 'Nhanh chóng · An toàn · Chuyên nghiệp';
  const contactPhone = (config as any)?.contactPhone || '';

  const features = config?.features?.length ? config.features : [
    { id: 1, title: 'Đội ngũ chuyên gia', description: 'Y bác sĩ tận tâm, giàu kinh nghiệm', icon: 'Stethoscope' },
    { id: 2, title: 'Thiết bị hiện đại', description: 'Đạt chuẩn quốc tế, kết quả chính xác', icon: 'Activity' },
    { id: 3, title: 'Thủ tục nhanh gọn', description: 'Tối ưu quy trình, tiết kiệm thời gian', icon: 'Clock' },
  ];

  const faq = config?.faq?.length ? config.faq : [];

  return (
    <div className="bg-[#f8fafc] min-h-screen">

      {/* HERO — compact */}
      <div className="bg-gradient-to-r from-gov-primary to-gov-primary-dark text-white py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-white/70 mb-4 gap-1.5">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="text-white font-medium">Dịch vụ - Sản phẩm</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1.5">
                {heroTitle}
              </h1>
              <p className="text-white/80 text-base">{heroSubtitle}</p>
            </div>
            {contactPhone && (
              <a
                href={`tel:${contactPhone.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gov-primary rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm shrink-0"
              >
                <Phone className="w-4 h-4" />
                {contactPhone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* FEATURES — 3 cột nhỏ gọn */}
      <div className="container mx-auto px-4 max-w-7xl -mt-0 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feat: any, idx: number) => {
            const Icon = ICON_MAP[feat.icon] || HeartPulse;
            return (
              <div key={feat.id || idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-[var(--primary-50)] text-gov-primary rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-0.5">{feat.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DANH SÁCH DỊCH VỤ */}
      <div id="services-list" className="container mx-auto px-4 max-w-7xl py-6 scroll-mt-4">

        {/* Tiêu đề + bộ lọc danh mục */}
        <div className="global-section-header mb-6">
          <h2 className="global-section-title">Danh mục dịch vụ</h2>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="px-4 py-1.5 bg-gov-primary text-white rounded-full text-sm font-bold shadow-sm">
              Tất cả
            </div>
            {categories.map((cat: any) => (
              <div key={cat.id} className="px-4 py-1.5 bg-white text-gray-600 hover:bg-[var(--primary-50)] hover:text-gov-primary rounded-full text-sm font-medium transition-colors cursor-pointer border border-gray-200">
                {cat.name}
              </div>
            ))}
          </div>
        )}

        {/* Grid card ngang — 2 cột */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc: any) => {
              const thumbUrl = svc.thumbnail?.url || null;
              return (
                <Link
                  key={svc.id}
                  href={`/dich-vu/${svc.slug || svc.id}`}
                  className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[var(--primary-100)] transition-all duration-200 flex overflow-hidden"
                >
                  {/* Ảnh thumbnail nhỏ bên trái */}
                  <div className="w-28 md:w-36 shrink-0 bg-[var(--primary-50)] relative overflow-hidden">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={svc.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--primary-100)]">
                        <HeartPulse className="w-10 h-10" />
                      </div>
                    )}
                  </div>

                  {/* Nội dung bên phải */}
                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div>
                      {svc.category && typeof svc.category === 'object' && (
                        <span className="text-[10px] font-bold text-gov-primary uppercase tracking-wider bg-[var(--primary-50)] px-2 py-0.5 rounded mb-1.5 inline-block">
                          {svc.category.name}
                        </span>
                      )}
                      <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-gov-primary transition-colors line-clamp-2 mb-1">
                        {svc.title}
                      </h3>
                      {svc.shortDescription && (
                        <p className="text-gray-400 text-xs line-clamp-1">{svc.shortDescription}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      {svc.price ? (
                        <span className="text-sm font-extrabold text-rose-600">{svc.price}</span>
                      ) : (
                        <span className="text-xs text-gray-400">Liên hệ để biết giá</span>
                      )}
                      <span className="text-gov-primary flex items-center gap-1 text-xs font-semibold">
                        Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có dịch vụ nào được đăng tải.</p>
          </div>
        )}
      </div>

      {/* FAQ — chỉ hiện khi có dữ liệu */}
      {faq.length > 0 && (
        <div className="container mx-auto px-4 max-w-7xl py-6">
          <div className="global-section-header mb-6">
            <h2 className="global-section-title">Câu hỏi thường gặp</h2>
          </div>
          <div className="space-y-2">
            {faq.map((item: any, idx: number) => (
              <details
                key={item.id || idx}
                className="group bg-white border border-gray-100 rounded-xl [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer font-semibold text-gray-800 text-sm">
                  {item.question}
                  <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* CTA cuối — gọn nhẹ */}
      <div id="contact" className="bg-gov-primary mt-4">
        <div className="container mx-auto px-4 max-w-7xl py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-lg">Cần tư vấn thêm về dịch vụ?</p>
            <p className="text-white/70 text-sm">Đội ngũ CDC sẵn sàng hỗ trợ bạn.</p>
          </div>
          {contactPhone && (
            <a
              href={`tel:${contactPhone.replace(/\D/g, '')}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gov-primary rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm shrink-0"
            >
              <Phone className="w-4 h-4" />
              {contactPhone}
            </a>
          )}
        </div>
      </div>

    </div>
  );
}
