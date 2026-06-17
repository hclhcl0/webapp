import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, ArrowRight, HeartPulse, Search, Layers, 
  ShoppingCart, Tag, ShieldCheck, Clock, CheckCircle2,
  Stethoscope, Activity, Star, HelpCircle, Phone
} from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

async function getLandingData() {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Fetch global landing settings
    const landingConfig = await payload.findGlobal({
      slug: 'servicesLanding',
    });

    // Fetch categories
    const categoriesData = await payload.find({
      collection: 'serviceCategories',
      sort: 'order',
      limit: 100,
    });
    
    // Fetch services
    const servicesData = await payload.find({
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

export default async function ServicesLandingPage() {
  const { config, categories, services } = await getLandingData();

  // Fallback data if config is empty
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

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-gradient-to-br from-gov-primary to-gov-primary-dark text-white pt-24 pb-32 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: `url(${heroBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        ></div>
        {/* Soft geometric blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 mb-8">
            <HeartPulse className="w-5 h-5 text-teal-300 mr-2" />
            <span className="text-teal-50 font-medium tracking-wide">Trung Tâm Kiểm Soát Bệnh Tật</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-balance max-w-5xl mx-auto">
            {heroTitle}
          </h1>
          
          <p className="text-teal-100 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed mb-10 text-balance">
            {heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#services-list" className="px-8 py-4 bg-white text-gov-primary hover:bg-gray-50 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl shadow-white/10 hover:-translate-y-1 hover:shadow-2xl flex items-center">
              Khám phá Dịch vụ <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <a href="#contact" className="px-8 py-4 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 rounded-xl font-bold text-lg transition-all duration-300 flex items-center">
              <Phone className="w-5 h-5 mr-2" /> Cần tư vấn ngay?
            </a>
          </div>
        </div>
      </div>

      {/* 2. WHY CHOOSE US (Features) */}
      <div className="container mx-auto px-4 max-w-7xl -mt-16 relative z-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat: any, idx: number) => (
            <div key={feat.id || idx} className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-teal-50 text-gov-primary rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FEATURED SERVICES TAB / GRID */}
      <div id="services-list" className="py-20 bg-white border-y border-gray-100 scroll-mt-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Danh mục Dịch vụ nổi bật</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Lựa chọn các gói khám, xét nghiệm và tiêm chủng phù hợp với nhu cầu của bạn và gia đình.</p>
          </div>

          {/* Simple Tab navigation simulation */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <div className="px-6 py-2.5 bg-gov-primary text-white rounded-full font-bold shadow-md shadow-gov-primary/30">
                Tất cả dịch vụ
              </div>
              {categories.map((cat: any) => (
                <div key={cat.id} className="px-6 py-2.5 bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-gov-primary rounded-full font-medium transition-colors cursor-pointer border border-gray-200">
                  {cat.name}
                </div>
              ))}
            </div>
          )}

          {/* Grid Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((svc: any) => {
              const thumbUrl = svc.thumbnail?.url || '/images/service-placeholder.jpg';
              return (
                <div key={svc.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group">
                  <Link href={`/dich-vu/${svc.slug || svc.id}`} className="block relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {svc.thumbnail ? (
                      <img src={thumbUrl} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-200">
                        <HeartPulse className="w-20 h-20" />
                      </div>
                    )}
                    {svc.category && typeof svc.category === 'object' && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gov-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {svc.category.name}
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <Link href={`/dich-vu/${svc.slug || svc.id}`}>
                      <h3 className="font-bold text-xl text-gray-900 leading-snug group-hover:text-gov-primary transition-colors line-clamp-2 mb-3">
                        {svc.title}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-grow">
                      {svc.shortDescription || 'Mô tả chi tiết dịch vụ đang được cập nhật.'}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="text-lg font-extrabold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                        {svc.price || 'Đang cập nhật'}
                      </div>
                      <Link href={`/dich-vu/${svc.slug || svc.id}`} className="w-10 h-10 bg-gray-50 text-gray-500 group-hover:bg-gov-primary group-hover:text-white rounded-full flex items-center justify-center transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {services.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có dịch vụ nào được đăng tải.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. PROCESS (Quy trình) */}
      <div className="py-20 bg-[#f8fafc]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Quy trình thực hiện tinh gọn</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Trải nghiệm dịch vụ y tế dễ dàng, giảm thiểu thời gian chờ đợi với quy trình 4 bước tiêu chuẩn.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            
            {process.map((step: any, idx: number) => (
              <div key={step.id || idx} className="relative z-10 flex flex-col items-center w-full md:w-1/4 px-4 mb-10 md:mb-0">
                <div className="w-16 h-16 bg-gov-primary text-white text-2xl font-bold rounded-full flex items-center justify-center mb-6 shadow-[0_0_0_8px_rgba(255,255,255,1)] ring-1 ring-gray-100">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{step.title}</h3>
                <p className="text-gray-500 text-center text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. FAQ SECTION */}
      {faq.length > 0 && (
        <div className="py-20 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-teal-50 text-gov-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Câu hỏi thường gặp</h2>
            </div>

            <div className="space-y-4">
              {faq.map((item: any, idx: number) => (
                <details key={item.id || idx} className="group bg-gray-50 border border-gray-100 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-gray-900 text-lg">
                    {item.question}
                    <span className="ml-6 flex-shrink-0 bg-white w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 group-open:bg-gov-primary group-open:text-white transition-colors">
                      <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. FINAL CTA */}
      <div id="contact" className="py-24 bg-gov-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Bạn cần tư vấn thêm?</h2>
          <p className="text-teal-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn lựa chọn dịch vụ phù hợp nhất.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:19001234" className="px-10 py-5 bg-white text-gov-primary hover:bg-gray-50 rounded-full font-bold text-xl transition-all duration-300 shadow-2xl flex items-center">
              <Phone className="w-6 h-6 mr-3" /> Gọi ngay: 1900 1234
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
