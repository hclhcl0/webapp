"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { VaccinePackageUI } from './VaccinePackageUI';
import { Search, ChevronDown, CheckCircle, ArrowDownUp } from 'lucide-react';

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

const DISEASE_ICONS: Record<string, string> = {
  'Vắc xin phòng Ung thư do HPV': '🧬',
  'Vắc xin 6 trong 1': '🦠',
  'Vắc xin phòng bệnh do Phế cầu': '🫁',
  'Vắc xin phòng Sốt xuất huyết': '🦟',
  'Vắc xin phòng Tiêu chảy do Rota virus': '💧',
  'Vắc xin phòng Sởi Quai bị Rubella': '🤒',
  'Vắc xin phòng Thủy đậu': 'pox',
  'Vắc xin phòng Bạch hầu Ho gà Uốn ván': '🗣️',
  'Vắc xin phòng bệnh virus hợp bào hô hấp - RSV': '🌬️',
  'Vắc xin phòng Cúm': '🤧',
  'Vắc xin phòng Viêm gan': '🩸',
  'Vắc xin phòng Zona thần kinh (Herpes Zoster)': '⚡',
  'Vắc xin phòng Lao': '🫁',
  'Vắc xin phòng Viêm màng não': '🧠',
  'Vắc xin phòng Dại': '🐕',
  'Vắc xin phòng Thương hàn': '🍲',
  'Vắc xin phòng Viêm não Nhật Bản': '🧠',
  'Vắc xin phòng Tả': '💧',
};

function getIconForDisease(disease: string) {
  // Try to find a matching key
  const match = Object.keys(DISEASE_ICONS).find(k => disease.toLowerCase().includes(k.toLowerCase().replace('vắc xin phòng ', '')));
  return match ? DISEASE_ICONS[match] : '💉';
}

export function VaccineMainUI({ packages, vaccines, banners, phoneNumber }: Props) {
  const [activeTab, setActiveTab] = useState<'disease' | 'package'>('disease');
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');

  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  // Group diseases
  const diseases = useMemo(() => {
    const uniqueDiseases = Array.from(new Set(vaccines.map(v => v.disease))).filter(Boolean);
    return uniqueDiseases.map(d => ({
      name: d,
      icon: getIconForDisease(d),
      count: vaccines.filter(v => v.disease === d).length,
    }));
  }, [vaccines]);

  // Filter and sort vaccines
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
    <div className="w-full">
      {/* ── Banners ── */}
      {banners && banners.length > 0 ? (
        <div className="w-full bg-white relative overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {banners.map((banner) => {
              const slideContent = (
                <div key={banner.id} className="relative flex-[0_0_100%] min-w-0">
                  <div className="w-full relative aspect-[21/9] md:aspect-[3/1] bg-gray-100">
                    {/* Desktop Image */}
                    <Image
                      src={banner.image?.url || ''}
                      alt={banner.title || ''}
                      fill
                      className={`object-cover ${banner.mobileImage?.url ? 'hidden md:block' : ''}`}
                      priority
                    />
                    {/* Mobile Image */}
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
                    className="flex-[0_0_100%] min-w-0"
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
        <div className="w-full bg-white relative overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {[1, 2].map((_, idx) => (
              <div key={idx} className="relative flex-[0_0_100%] min-w-0">
                <div className="w-full h-[200px] md:h-[350px] bg-gradient-to-r from-blue-600 to-cyan-500 relative flex items-center px-8 md:px-20">
                  <div className="text-white z-10 max-w-xl">
                    <h2 className="text-2xl md:text-5xl font-black mb-2 uppercase text-yellow-300 drop-shadow-md">
                      GÓI VẮC XIN NGỪA HPV
                    </h2>
                    <p className="text-lg md:text-2xl font-semibold mb-4">Tư vấn cùng Bác sĩ 24/7</p>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/40">
                      <span className="font-medium">Đặt lịch ngay</span>
                      <span className="font-bold text-yellow-300">{phoneNumber}</span>
                    </div>
                  </div>
                  {/* Decorative background elements */}
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-7xl py-8">
        
        {/* ── Title & Tabs ── */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Danh mục vắc xin</h1>
            <div className="inline-flex bg-gray-100 rounded-full p-1 border border-gray-200">
              <button
                onClick={() => setActiveTab('disease')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all \${activeTab === 'disease' ? 'bg-[#00a896] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Vắc xin phòng bệnh
              </button>
              <button
                onClick={() => setActiveTab('package')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all \${activeTab === 'package' ? 'bg-[#00a896] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Gói vắc xin
              </button>
            </div>
          </div>
          <div className="hidden md:block w-48 h-32 relative">
             <div className="absolute inset-0 bg-blue-50 rounded-2xl flex items-center justify-center opacity-50">
               <span className="text-4xl">🛡️</span>
             </div>
          </div>
        </div>

        {/* ── Tab Content ── */}
        {activeTab === 'package' ? (
          <VaccinePackageUI packages={packages} phoneNumber={phoneNumber} />
        ) : (
          <div className="flex flex-col gap-8">
            
            {/* ── Disease Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <button
                 onClick={() => setSelectedDisease(null)}
                 className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left bg-white
                  \${selectedDisease === null ? 'border-[#00a896] shadow-md ring-4 ring-[#00a896]/10' : 'border-gray-100 hover:border-[#00a896]/40 hover:shadow-sm'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                  📋
                </div>
                <span className="font-bold text-sm text-gray-700 leading-tight">Tất cả vắc xin</span>
              </button>

              {diseases.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDisease(d.name)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left bg-white
                    \${selectedDisease === d.name ? 'border-[#00a896] shadow-md ring-4 ring-[#00a896]/10' : 'border-gray-100 hover:border-[#00a896]/40 hover:shadow-sm'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl flex-shrink-0 border border-teal-100">
                    {d.icon === 'pox' ? '🦠' : d.icon}
                  </div>
                  <span className="font-bold text-sm text-gray-700 leading-tight">{d.name}</span>
                </button>
              ))}
            </div>

            {/* ── Vaccine List ── */}
            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-6">
                
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm vắc xin..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Sort Filters */}
                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                  <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Sắp xếp theo:</span>
                  <div className="flex bg-gray-50 p-1 rounded-full border border-gray-200">
                    <button
                      onClick={() => setSortBy('popular')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all \${sortBy === 'popular' ? 'bg-white text-[#00a896] shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Được quan tâm
                    </button>
                    <button
                      onClick={() => setSortBy('price_asc')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all \${sortBy === 'price_asc' ? 'bg-white text-[#00a896] shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Giá thấp
                    </button>
                    <button
                      onClick={() => setSortBy('price_desc')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all \${sortBy === 'price_desc' ? 'bg-white text-[#00a896] shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Giá cao
                    </button>
                  </div>
                </div>
              </div>

              {/* List */}
              {filteredVaccines.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Không tìm thấy vắc xin nào phù hợp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVaccines.map((v) => (
                    <div key={v.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all bg-gray-50/50 hover:bg-white">
                      <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl flex-shrink-0 self-start">
                        {getIconForDisease(v.disease) === 'pox' ? '🦠' : getIconForDisease(v.disease)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-800 text-[15px] leading-snug">{v.name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap \${v.status === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {v.status === 'in_stock' ? 'Còn hàng' : 'Hết hàng'}
                          </span>
                        </div>
                        <p className="text-xs text-[#00a896] font-semibold mb-2 flex items-center gap-1">
                          <CheckCircle size={12} /> {v.disease}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <div>
                            <p className="text-gray-400 mb-0.5">Xuất xứ</p>
                            <p className="font-medium text-gray-700">{v.origin}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-0.5">Đối tượng</p>
                            <p className="font-medium text-gray-700 line-clamp-1" title={v.target_group}>{v.target_group}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-end justify-between border-t border-gray-100 pt-3">
                          <p className="text-xs text-gray-500 font-medium">Giá bán:</p>
                          <p className="text-lg font-black text-[#f4a261]">
                            {v.price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
