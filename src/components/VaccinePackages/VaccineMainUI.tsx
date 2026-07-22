"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { VaccinePackageUI } from './VaccinePackageUI';
import { Search, ChevronRight, Shield, Syringe, Activity, Baby, Stethoscope, ChevronDown } from 'lucide-react';

interface Vaccine {
  id: string;
  name: string;
  disease: string;
  origin: string;
  price: number;
  target_group: string;
  status: 'in_stock' | 'out_of_stock';
}

interface Banner {
  id: string;
  title: string;
  image: { url: string; alt?: string };
  mobileImage?: { url: string; alt?: string };
  link?: string;
  openInNewTab?: boolean;
}

interface Props {
  packages: any[];
  vaccines: Vaccine[];
  banners?: Banner[];
  phoneNumber: string;
}

const DISEASE_ICONS: Record<string, React.ReactNode> = {
  'Vắc xin phòng Ung thư do HPV': <Activity size={18} />,
  'Vắc xin 6 trong 1': <Baby size={18} />,
  'Vắc xin phòng bệnh do Phế cầu': <Stethoscope size={18} />,
  'Vắc xin phòng Sốt xuất huyết': <Shield size={18} />,
  'Vắc xin phòng Tiêu chảy do Rota virus': <Activity size={18} />,
  'Vắc xin phòng Sởi Quai bị Rubella': <Syringe size={18} />,
  'Vắc xin phòng Thủy đậu': <Shield size={18} />,
  'Vắc xin phòng Bạch hầu Ho gà Uốn ván': <Activity size={18} />,
  'Vắc xin phòng bệnh virus hợp bào hô hấp - RSV': <Stethoscope size={18} />,
};

function getIconForDisease(disease: string) {
  const match = Object.keys(DISEASE_ICONS).find(k => disease.toLowerCase().includes(k.toLowerCase().replace('vắc xin phòng ', '')));
  return match ? DISEASE_ICONS[match] : <Syringe size={18} />;
}

export function VaccineMainUI({ packages, vaccines, banners, phoneNumber }: Props) {
  const [activeTab, setActiveTab] = useState<'disease' | 'package'>('disease');
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDisease, searchQuery, sortBy]);

  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  const diseases = useMemo(() => {
    const uniqueDiseases = Array.from(new Set(vaccines.map(v => v.disease))).filter(Boolean);
    return uniqueDiseases.map(d => ({
      name: d,
      icon: getIconForDisease(d),
      count: vaccines.filter(v => v.disease === d).length,
    }));
  }, [vaccines]);

  const filteredVaccines = useMemo(() => {
    let filtered = vaccines;
    if (selectedDisease) {
      filtered = filtered.filter(v => v.disease === selectedDisease);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(v => v.name.toLowerCase().includes(q) || v.disease.toLowerCase().includes(q));
    }

    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [vaccines, selectedDisease, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredVaccines.length / itemsPerPage);
  const currentVaccines = filteredVaccines.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full bg-[#f4f6f9] min-h-screen pb-12">
      
      {/* ── Banners (Container rounded) ── */}
      <div className="container mx-auto px-4 max-w-7xl pt-6 mb-6">
        {banners && banners.length > 0 ? (
          <div className="w-full bg-white relative overflow-hidden rounded-2xl shadow-sm border-2 border-white" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {banners.map((banner) => {
                const slideContent = (
                  <div key={banner.id} className="relative flex-[0_0_100%] min-w-0">
                    <div className="w-full relative aspect-[21/9] md:aspect-[5/1] bg-gray-100">
                      <Image
                        src={banner.image?.url || ''}
                        alt={banner.title || ''}
                        fill
                        className={`object-cover ${banner.mobileImage?.url ? 'hidden md:block' : ''}`}
                        priority
                      />
                      {banner.mobileImage?.url && (
                        <Image
                          src={banner.mobileImage.url}
                          alt={banner.title || ''}
                          fill
                          className="object-cover md:hidden"
                          priority
                        />
                      )}
                    </div>
                  </div>
                );

                if (banner.link) {
                  return (
                    <a
                      key={banner.id}
                      href={banner.link}
                      target={banner.openInNewTab ? '_blank' : undefined}
                      rel={banner.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="flex-[0_0_100%] min-w-0 block"
                    >
                      {slideContent}
                    </a>
                  );
                }
                return slideContent;
              })}
            </div>
          </div>
        ) : (
          <div className="w-full bg-white relative overflow-hidden rounded-2xl shadow-sm border-2 border-white" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {[1, 2].map((_, idx) => (
                <div key={idx} className="relative flex-[0_0_100%] min-w-0">
                  <div className="w-full h-[160px] md:h-[240px] bg-gradient-to-r from-[#007a8c] to-[#0ea5e9] relative flex items-center px-6 md:px-16">
                    <div className="text-white z-10 max-w-xl">
                      <h2 className="text-xl md:text-4xl font-bold mb-2 uppercase text-yellow-300 drop-shadow-md">
                        GÓI VẮC XIN NGỪA HPV
                      </h2>
                      <p className="text-base md:text-xl font-semibold mb-4 text-[#f0f9fa]">Bảo vệ toàn diện sức khỏe</p>
                      <div className="inline-flex items-center gap-2 bg-white text-[#007a8c] rounded-full px-5 py-2.5 font-bold shadow-md hover:bg-yellow-50 transition cursor-pointer">
                        <span>Tư vấn ngay: {phoneNumber}</span>
                      </div>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── GLOBAL TABS ── */}
      <div className="container mx-auto px-4 max-w-7xl mb-6 flex justify-center">
        <div className="flex gap-1 w-full sm:w-fit bg-white p-1 rounded-full shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('disease')}
            className={`flex-1 sm:w-48 py-2 px-4 rounded-full text-center font-bold text-[14px] transition-all ${activeTab === 'disease' ? 'text-white bg-[#007a8c] shadow-md' : 'text-gray-600 bg-transparent hover:bg-[#f0f9fa]'}`}
          >
            Vắc xin phòng bệnh
          </button>
          <button
            onClick={() => setActiveTab('package')}
            className={`flex-1 sm:w-48 py-2 px-4 rounded-full text-center font-bold text-[14px] transition-all ${activeTab === 'package' ? 'text-white bg-[#007a8c] shadow-md' : 'text-gray-600 bg-transparent hover:bg-[#f0f9fa]'}`}
          >
            Gói vắc xin
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {activeTab === 'disease' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col lg:flex-row p-4 md:p-6 md:pb-4 gap-6 relative">
            
            {/* ── LEFT SIDEBAR (Desktop) / TOP MENU (Mobile) ── */}
            <div className="w-full lg:w-1/4 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-4 relative">
              <div className="sticky top-24 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
                
                {/* Disease Categories List */}
                <div className="p-1.5">
                    <button
                      onClick={() => setSelectedDisease(null)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${selectedDisease === null ? 'bg-[#007a8c] text-white font-bold' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}
                    >
                      <span className="text-[13px]">Tất cả vắc xin</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedDisease === null ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {vaccines.length}
                      </span>
                    </button>

                    {diseases.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedDisease(d.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left mt-0.5 ${selectedDisease === d.name ? 'bg-[#007a8c] text-white font-bold' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}
                      >
                        <span className="text-[13px] leading-snug line-clamp-2 pr-2">{d.name}</span>
                      </button>
                    ))}
                  </div>
              </div>
            </div>

            {/* ── RIGHT MAIN CONTENT ── */}
            <div className="w-full lg:w-3/4 flex-1">
              <div className="flex flex-col gap-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Tìm tên vắc xin hoặc loại bệnh..."
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#007a8c]/30 focus:border-[#007a8c] transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap hidden sm:block uppercase tracking-wider">Sắp xếp:</span>
                    <button
                      onClick={() => setSortBy('popular')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${sortBy === 'popular' ? 'bg-[#f0f9fa] text-[#007a8c] border border-[#d0eef2]' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      Bán chạy
                    </button>
                    <button
                      onClick={() => setSortBy('price_asc')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${sortBy === 'price_asc' ? 'bg-[#f0f9fa] text-[#007a8c] border border-[#d0eef2]' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      Giá thấp
                    </button>
                    <button
                      onClick={() => setSortBy('price_desc')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${sortBy === 'price_desc' ? 'bg-[#f0f9fa] text-[#007a8c] border border-[#d0eef2]' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      Giá cao
                    </button>
                  </div>
                </div>

                {/* Grid of Vaccines */}
                {filteredVaccines.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                       <Search size={24} />
                    </div>
                    <p className="text-lg font-bold text-gray-700 mb-1">Không tìm thấy kết quả</p>
                    <p className="text-gray-500 text-sm">Thử tìm kiếm với một từ khóa khác hoặc bỏ chọn bệnh lý.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {currentVaccines.map((v) => (
                      <div key={v.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-[#007a8c]/30 hover:-translate-y-0.5 transition-all duration-200 flex flex-col group cursor-pointer p-3">
                        {/* Header: Disease & Badge */}
                        <div className="flex justify-between items-start mb-1.5 gap-2">
                           <p className="text-[10px] font-bold text-[#007a8c] uppercase tracking-wider line-clamp-1 leading-snug">{v.disease}</p>
                           <div className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded flex-shrink-0
                            ${v.status === 'in_stock' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}
                           >
                            {v.status === 'in_stock' ? 'Còn hàng' : 'Hết hàng'}
                           </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-gray-800 text-[13px] leading-snug mb-2 line-clamp-2 group-hover:text-[#007a8c] transition-colors">{v.name}</h3>

                        {/* Info list */}
                        <div className="flex flex-col gap-1 mb-3 flex-1">
                            {v.origin && (
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0"></span>
                                <span className="text-gray-500">Xuất xứ: <span className="text-gray-800 font-semibold">{v.origin}</span></span>
                              </div>
                            )}
                            {v.target_group && (
                              <div className="flex items-start gap-1.5 text-[11px]">
                                <span className="w-1 h-1 rounded-full bg-[#007a8c] mt-1.5 flex-shrink-0"></span>
                                <span className="text-gray-800 font-medium line-clamp-2 leading-tight" title={v.target_group}>{v.target_group}</span>
                              </div>
                            )}
                        </div>

                        {/* Footer: Price and Button */}
                        <div className="flex items-end justify-between mt-auto pt-2.5 border-t border-gray-100">
                           <div className="flex flex-col">
                             <span className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Giá bán</span>
                             <span className="text-[14px] font-bold text-[#e02b2b] leading-none">{v.price.toLocaleString('vi-VN')}đ</span>
                           </div>
                           <button className="bg-white border border-[#007a8c] text-[#007a8c] font-bold py-1 px-3 rounded transition-colors text-[11px] flex items-center justify-center gap-0.5 group-hover:bg-[#007a8c] group-hover:text-white shadow-sm">
                             Đăng ký <ChevronRight size={12} />
                           </button>
                        </div>
                      </div>
                    ))}
                    </div>
                    
                    {/* Pagination UI */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-6 mb-1">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-gray-600 hover:bg-[#007a8c] hover:text-white hover:border-[#007a8c] shadow-sm'}`}
                        >
                          <ChevronRight className="rotate-180" size={18} />
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentPage === page ? 'bg-[#007a8c] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-gray-600 hover:bg-[#007a8c] hover:text-white hover:border-[#007a8c] shadow-sm'}`}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full pt-4">
            <VaccinePackageUI packages={packages} vaccines={vaccines} phoneNumber={phoneNumber} />
          </div>
        )}
      </div>
    </div>
  );
}
