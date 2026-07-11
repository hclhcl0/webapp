import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, ArrowRight, HeartPulse, Search, 
  ShoppingCart, Tag, ShieldCheck, Clock, CheckCircle2,
  Stethoscope, Activity, Star, HelpCircle, Phone
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
      config: landingConfig as any,
      categories: categoriesData.docs,
      services: servicesData.docs,
    };
  } catch (err) {
    console.error('Failed to fetch landing data:', err);
    return { config: null, categories: [], services: [] };
  }
}

export default async function ServicesLandingPage() {
  const { config, categories, services } = await getLandingData();

  const heroTitle = config?.hero?.title || 'Chăm sóc sức khỏe toàn diện';
  const heroSubtitle = config?.hero?.subtitle || 'Nhanh chóng, An toàn, Chuyên nghiệp';
  const heroBgObj = config?.hero?.backgroundImage as any;
  const heroBgUrl = heroBgObj?.url || 'https://www.transparenttextures.com/patterns/cubes.png';
  
  const features = config?.features?.length ? config.features : [
    { id: 1, title: 'Đội ngũ chuyên gia', description: 'Các y bác sĩ tận tâm, giàu kinh nghiệm', icon: 'Stethoscope' },
    { id: 2, title: 'Trang thiết bị hiện đại', description: 'Đạt chuẩn quốc tế, cho kết quả chính xác', icon: 'Activity' },
    { id: 3, title: 'Thủ tục nhanh gọn', description: 'Tối ưu hóa quy trình, tiết kiệm thời gian', icon: 'Clock' },
  ];

  const process = config?.process?.length ? config.process : [
    { id: 1, title: 'Đăng ký', description: 'Điền thông tin trực tuyến hoặc tại quầy' },
    { id: 2, title: 'Khám & Tư vấn', description: 'Bác sĩ chuyên khoa trực tiếp thăm khám' },
    { id: 3, title: 'Thực hiện dịch vụ', description: 'Tiến hành xét nghiệm, tiêm chủng...' },
    { id: 4, title: 'Nhận kết quả', description: 'Nhận kết quả nhanh chóng, chính xác' },
  ];

  const faq = config?.faq?.length ? config.faq : [];
  
  const ctaTitle = config?.cta?.title || 'Bạn cần tư vấn thêm?';
  const ctaDesc = config?.cta?.description || 'Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn lựa chọn dịch vụ phù hợp nhất.';
  const ctaPhone = config?.cta?.phoneNumber || '1900 1234';
  const ctaPhoneUrl = ctaPhone.replace(/\D/g, '');

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-gradient-to-br from-gov-primary to-gov-primary-dark text-white pt-14 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: `url(${heroBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        ></div>
        {/* Soft geometric blobs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-400 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-balance max-w-5xl mx-auto">
            {heroTitle}
          </h1>
          
          <p className="text-teal-100 text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-8 text-balance">
            {heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#services-list" className="px-7 py-3 bg-white text-gov-primary hover:bg-gray-50 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:-translate-y-0.5 flex items-center">
              Khám phá Dịch vụ <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <a href="#contact" className="px-7 py-3 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 rounded-xl font-bold text-base transition-all duration-300 flex items-center">
              <Phone className="w-4 h-4 mr-2" /> Cần tư vấn ngay?
            </a>
          </div>
        </div>
      </div>

      {/* 2. WHY CHOOSE US (Features) */}
      <div className="container mx-auto px-4 max-w-7xl -mt-10 relative z-20 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feat: any, idx: number) => (
            <div key={feat.id || idx} className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-11 h-11 bg-teal-50 text-gov-primary rounded-xl flex items-center justify-center mb-4">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">{feat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FEATURED SERVICES GRID */}
      <div id="services-list" className="py-10 bg-white border-y border-gray-100 scroll-mt-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Danh mục Dịch vụ nổi bật</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm">Lựa chọn các gói khám, xét nghiệm và tiêm chủng phù hợp với nhu cầu của bạn và gia đình.</p>
          </div>

          {/* Tab danh mục */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <div className="px-5 py-2 bg-gov-primary text-white rounded-full font-bold text-sm shadow-sm">
                Tất cả dịch vụ
              </div>
              {categories.map((cat: any) => (
                <div key={cat.id} className="px-5 py-2 bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-gov-primary rounded-full font-medium text-sm transition-colors cursor-pointer border border-gray-200">
                  {cat.name}
                </div>
              ))}
            </div>
          )}

          {/* Grid Services — 3 cột */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc: any) => {
              const thumbUrl = svc.thumbnail?.url || '/images/service-placeholder.jpg';
              return (
                <div key={svc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
                  <Link href={`/dich-vu/${svc.slug || svc.id}`} className="block relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {svc.thumbnail ? (
                      <img src={thumbUrl} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-200">
                        <HeartPulse className="w-16 h-16" />
                      </div>
                    )}
                    {svc.category && typeof svc.category === 'object' && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gov-primary text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {svc.category.name}
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-4 flex-grow flex flex-col">
                    <Link href={`/dich-vu/${svc.slug || svc.id}`}>
                      <h3 className="font-bold text-base text-gray-900 leading-snug group-hover:text-gov-primary transition-colors line-clamp-2 mb-2">
                        {svc.title}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                      {svc.shortDescription || 'Mô tả chi tiết dịch vụ đang được cập nhật.'}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="text-base font-extrabold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 text-sm">
                        {svc.price || 'Đang cập nhật'}
                      </div>
                      <Link href={`/dich-vu/${svc.slug || svc.id}`} className="w-9 h-9 bg-gray-50 text-gray-500 group-hover:bg-gov-primary group-hover:text-white rounded-full flex items-center justify-center transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {services.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Chưa có dịch vụ nào được đăng tải.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. PROCESS (Quy trình) */}
      <div className="py-12 bg-[#f8fafc]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Quy trình thực hiện tinh gọn</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm">Trải nghiệm dịch vụ y tế dễ dàng, giảm thiểu thời gian chờ đợi với quy trình 4 bước tiêu chuẩn.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start relative">
            <div className="hidden md:block absolute top-7 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
            
            {process.map((step: any, idx: number) => (
              <div key={step.id || idx} className="relative z-10 flex flex-col items-center w-full md:w-1/4 px-4 mb-8 md:mb-0">
                <div className="w-14 h-14 bg-gov-primary text-white text-xl font-bold rounded-full flex items-center justify-center mb-4 shadow-[0_0_0_6px_rgba(255,255,255,1)] ring-1 ring-gray-100">
                  {idx + 1}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 text-center">{step.title}</h3>
                <p className="text-gray-500 text-center text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. FAQ SECTION */}
      {faq.length > 0 && (
        <div className="py-10 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-teal-50 text-gov-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Câu hỏi thường gặp</h2>
            </div>

            <div className="space-y-3">
              {faq.map((item: any, idx: number) => (
                <details key={item.id || idx} className="group bg-gray-50 border border-gray-100 rounded-xl [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-bold text-gray-900">
                    {item.question}
                    <span className="ml-4 flex-shrink-0 bg-white w-7 h-7 rounded-full flex items-center justify-center border border-gray-200 group-open:bg-gov-primary group-open:text-white transition-colors">
                      <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                    </span>
                  </summary>
                  <div className="px-5 pb-4 text-gray-600 leading-relaxed text-sm">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. FINAL CTA */}
      <div id="contact" className="py-12 bg-gov-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">{ctaTitle}</h2>
          <p className="text-teal-100 mb-6 max-w-2xl mx-auto text-sm">
            {ctaDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={`tel:${ctaPhoneUrl}`} className="px-8 py-3.5 bg-white text-gov-primary hover:bg-gray-50 rounded-full font-bold transition-all duration-300 shadow-lg flex items-center">
              <Phone className="w-5 h-5 mr-2" /> Gọi ngay: {ctaPhone}
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
