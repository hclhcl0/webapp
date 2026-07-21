"use client";

import React, { useState, useMemo } from 'react';
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

  return (
    <div className="w-full bg-[#f4f6f9] min-h-screen pb-12 font-sans">
      
      {/* ── Banners (Container rounded) ── */}
      <div className="container mx-auto px-4 max-w-7xl pt-6 mb-6">
        {banners && banners.length > 0 ? (
          <div className="w-full bg-white relative overflow-hidden rounded-2xl shadow-sm" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {banners.map((banner) => {
                const slideContent = (
                  <div key={banner.id} className="relative flex-[0_0_100%] min-w-0">
                    <div className="w-full relative aspect-[21/9] md:aspect-[4/1] bg-gray-100">
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
          <div className="w-full bg-white relative overflow-hidden rounded-2xl shadow-sm" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {[1, 2].map((_, idx) => (
                <div key={idx} className="relative flex-[0_0_100%] min-w-0">
                  <div className="w-full h-[180px] md:h-[280px] bg-gradient-to-r from-[#1250dc] to-[#0ea5e9] relative flex items-center px-6 md:px-16">
                    <div className="text-white z-10 max-w-xl">
                      <h2 className="text-xl md:text-4xl font-black mb-2 uppercase text-yellow-300 drop-shadow-md">
                        GÓI VẮC XIN NGỪA HPV
                      </h2>
                      <p className="text-base md:text-xl font-semibold mb-4 text-blue-50">Bảo vệ toàn diện sức khỏe</p>
                      <div className="inline-flex items-center gap-2 bg-white text-[#1250dc] rounded-full px-5 py-2.5 font-bold shadow-md hover:bg-yellow-50 transition cursor-pointer">
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

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* ── LEFT SIDEBAR (Desktop) / TOP MENU (Mobile) ── */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              
              {/* Type Switcher */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('disease')}
                  className={`flex-1 py-4 text-center font-bold text-[15px] transition-colors ${activeTab === 'disease' ? 'text-[#1250dc] border-b-2 border-[#1250dc] bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Vắc xin lẻ
                </button>
                <button
                  onClick={() => setActiveTab('package')}
                  className={`flex-1 py-4 text-center font-bold text-[15px] transition-colors ${activeTab === 'package' ? 'text-[#1250dc] border-b-2 border-[#1250dc] bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Gói vắc xin
                </button>
              </div>

              {/* Disease Categories List (Only show when activeTab is disease) */}
              {activeTab === 'disease' && (
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className="p-2">
                    <button
                      onClick={() => setSelectedDisease(null)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${selectedDisease === null ? 'bg-[#1250dc] text-white font-bold' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${selectedDisease === null ? 'bg-white/20' : 'bg-gray-200'}`}>
                           <Shield size={16} />
                        </div>
                        <span className="text-[14px]">Tất cả vắc xin</span>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${selectedDisease === null ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {vaccines.length}
                      </span>
                    </button>

                    {diseases.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedDisease(d.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left mt-1 ${selectedDisease === d.name ? 'bg-[#1250dc] text-white font-bold' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${selectedDisease === d.name ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#1250dc]'}`}>
                            {d.icon}
                          </div>
                          <span className="text-[14px] leading-tight line-clamp-2 pr-2">{d.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT MAIN CONTENT ── */}
          <div className="w-full lg:w-3/4 flex-1">
            {activeTab === 'package' ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 md:p-4">
                 <VaccinePackageUI packages={packages} phoneNumber={phoneNumber} />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Tìm tên vắc xin hoặc loại bệnh..."
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1250dc]/30 focus:border-[#1250dc] transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap hidden sm:block uppercase tracking-wider">Sắp xếp:</span>
                    <button
                      onClick={() => setSortBy('popular')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${sortBy === 'popular' ? 'bg-blue-50 text-[#1250dc] border border-blue-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      Bán chạy
                    </button>
                    <button
                      onClick={() => setSortBy('price_asc')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${sortBy === 'price_asc' ? 'bg-blue-50 text-[#1250dc] border border-blue-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      Giá thấp
                    </button>
                    <button
                      onClick={() => setSortBy('price_desc')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${sortBy === 'price_desc' ? 'bg-blue-50 text-[#1250dc] border border-blue-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredVaccines.map((v) => (
                      <div key={v.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer">
                        {/* Top Banner (Abstract representation of the product) */}
                        <div className="h-28 bg-gradient-to-br from-blue-50 to-[#e0e7ff] relative p-4 flex items-start justify-between border-b border-blue-50">
                          <div className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md whitespace-nowrap shadow-sm
                            ${v.status === 'in_stock' ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]' : 'bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]'}`}
                          >
                            {v.status === 'in_stock' ? 'Còn hàng' : 'Hết hàng'}
                          </div>
                          
                          <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center text-[#1250dc] absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-[5px] border-white z-10">
                             <Syringe size={28} strokeWidth={2} />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-5 pt-10 flex-1 flex flex-col bg-white">
                          <p className="text-[11px] font-bold text-[#1250dc] uppercase tracking-wider mb-1 line-clamp-1">{v.disease}</p>
                          <h3 className="font-bold text-gray-800 text-base leading-snug mb-4 line-clamp-2 min-h-[44px] group-hover:text-[#1250dc] transition-colors">{v.name}</h3>
                          
                          <div className="grid grid-cols-1 gap-2.5 mb-5 flex-1">
                            <div className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0"></span>
                              <div className="text-xs">
                                <span className="text-gray-500 font-medium">Xuất xứ: </span>
                                <span className="text-gray-800 font-semibold">{v.origin}</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0"></span>
                              <div className="text-xs">
                                <span className="text-gray-500 font-medium">Phòng bệnh: </span>
                                <span className="text-gray-800 font-semibold line-clamp-2" title={v.target_group}>{v.target_group}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100 flex items-center justify-between mb-4">
                             <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Giá bán</span>
                               <span className="text-xl font-black text-[#1250dc]">{v.price.toLocaleString('vi-VN')}đ</span>
                             </div>
                          </div>
                          
                          <button className="w-full bg-white border-2 border-[#1250dc] text-[#1250dc] hover:bg-[#1250dc] hover:text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 group-hover:bg-[#1250dc] group-hover:text-white shadow-sm">
                             Đăng ký <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
