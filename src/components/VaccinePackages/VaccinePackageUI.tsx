"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Phone, CheckCircle, ChevronRight, Shield, Clock, Package, ChevronDown } from "lucide-react";

interface VaccineItem {
  id: string;
  vaccine: { id?: string; name: string; origin?: string; disease?: string; price?: number };
  diseaseName?: string;
  doses: number;
  protocol?: string;
  unitPrice?: number;
  originalUnitPrice?: number;
}

interface VaccinePackage {
  id: string;
  name: string;
  targetGroup: string;
  packageType: string;
  image?: { url: string };
  description?: string;
  originalPrice?: number;
  discountPrice: number;
  discountLabel?: string;
  items: VaccineItem[];
  isFeatured?: boolean;
}

interface Props {
  packages: VaccinePackage[];
  vaccines?: any[];
  phoneNumber: string;
}

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export function VaccinePackageUI({ packages, vaccines = [], phoneNumber }: Props) {
  const featured = packages.find((p) => p.isFeatured) || packages[0];
  const [selected, setSelected] = useState<VaccinePackage | null>(featured || null);

  const [customDoses, setCustomDoses] = useState<Record<number, number>>({});
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<number, any>>({});

  useEffect(() => {
    setCustomDoses({});
    setSelectedAlternatives({});
  }, [selected?.id]);

  const handleDoseChange = (idx: number, delta: number, originalDoses: number) => {
    const current = customDoses[idx] !== undefined ? customDoses[idx] : originalDoses;
    const newVal = Math.max(0, current + delta);
    setCustomDoses(prev => ({ ...prev, [idx]: newVal }));
  };

  const getDynamicPrice = () => {
    if (!selected) return 0;
    let total = selected.discountPrice;
    selected.items?.forEach((item, idx) => {
      const originalQty = item.doses || 1;
      const currentQty = customDoses[idx] !== undefined ? customDoses[idx] : originalQty;
      const alt = selectedAlternatives[idx];
      
      // Remove original contribution
      total -= originalQty * (item.unitPrice || 0);
      
      // Add new contribution
      const newPrice = alt ? alt.price : (item.unitPrice || 0);
      total += currentQty * newPrice;
    });
    return Math.max(0, total);
  };

  const getDynamicOriginalPrice = () => {
    if (!selected) return 0;
    let total = selected.originalPrice || 0;
    selected.items?.forEach((item, idx) => {
      const originalQty = item.doses || 1;
      const currentQty = customDoses[idx] !== undefined ? customDoses[idx] : originalQty;
      const alt = selectedAlternatives[idx];
      
      // Remove original contribution
      total -= originalQty * (item.originalUnitPrice || item.unitPrice || 0);
      
      // Add new contribution
      const newPrice = alt ? alt.price : (item.originalUnitPrice || item.unitPrice || 0);
      total += currentQty * newPrice;
    });
    return Math.max(0, total);
  };

  const byAge = packages.filter((p) => p.packageType === "by_age");
  const byTarget = packages.filter((p) => p.packageType === "by_target");

  const benefits = [
    { icon: Clock, title: "Miễn phí nhắc lịch hẹn", sub: "Chính xác và khoa học cho cả gia đình" },
    { icon: Shield, title: "Cam kết giữ giá vắc xin", sub: "Suốt thời gian tiêm theo phác đồ" },
    { icon: Package, title: "Cam kết luôn đủ vắc xin", sub: "Không lo hàng khan hiếm" },
  ];

  const PackageCard = ({ pkg }: { pkg: VaccinePackage }) => {
    const isActive = selected?.id === pkg.id;
    return (
      <button
        onClick={() => setSelected(pkg)}
        className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer
          ${isActive
            ? "border-[#007a8c] bg-[#e6f4f4] shadow-sm"
            : "border-gray-100 bg-white hover:border-[#007a8c]/40 hover:bg-[#e6f4f4]/50"
          }`}
      >
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-xl border border-gray-200/80 overflow-hidden flex-shrink-0 bg-gray-100">
          {pkg.image?.url ? (
            <Image src={pkg.image.url} alt={pkg.name} width={56} height={56} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">💉</div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-[13px] leading-tight ${isActive ? "text-[#007a8c]" : "text-gray-800"}`}>
            {pkg.name}
          </p>
          
        </div>
        {isActive && <ChevronRight size={18} className="text-[#007a8c] flex-shrink-0" />}
      </button>
    );
  };

  return (
    <div className="w-full">
      {/* ─── Main Content ─────────────────────────────────────────── */}
      {packages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-16 text-center">
          <div className="text-6xl mb-4">💉</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Chưa có gói vắc xin nào</h2>
          <p className="text-gray-500 text-sm mb-6">Vui lòng thêm gói vắc xin trong trang quản trị CMS.</p>
          <a href={`tel:${phoneNumber}`}
            className="inline-flex items-center gap-2 bg-[#1250dc] text-white font-bold px-6 py-3 rounded-xl">
            <Phone size={17} />
            Gọi tư vấn: {phoneNumber}
          </a>
        </div>
      ) : (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden relative flex flex-col lg:block lg:min-h-[500px]">
        {/* ── Sidebar (Determines Height) ─────────────────────────── */}
        <div className="w-full lg:w-72 xl:w-80 lg:border-r border-gray-100 bg-gray-50 flex flex-col relative z-10">
          <div>
            {byAge.length > 0 && (
              <div>
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {byAge.length} Gói vắc xin theo độ tuổi
                  </p>
                </div>
                <div className="p-2 space-y-1.5">
                  {byAge.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
                </div>
              </div>
            )}
            {byTarget.length > 0 && (
              <div className={byAge.length > 0 ? "border-t border-gray-100" : ""}>
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {byTarget.length} Gói vắc xin theo đối tượng
                  </p>
                </div>
                <div className="p-2 space-y-1.5">
                  {byTarget.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Detail Panel ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col lg:absolute lg:top-0 lg:bottom-0 lg:left-72 xl:left-80 lg:right-0 bg-white overflow-hidden">
          {/* Header */}
          <div className="bg-[#f2f9f9] px-6 py-5 border-b border-gray-100">
            <h2 className="text-[22px] md:text-[24px] font-bold text-[#1f2937] uppercase tracking-tight">{selected?.name}</h2>
            {selected?.description && (
              <p className="text-sm text-gray-600 mt-2">{selected.description}</p>
            )}
          </div>

          {/* Table header */}
          {selected?.items && selected.items.length > 0 && (
            <div className="px-6 py-3 grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_100px_100px_120px] gap-4 border-b border-dashed border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#007a8c] flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[13px] font-bold text-gray-700">Vắc xin</span>
              </div>
              <div className="flex items-center gap-1 hidden md:flex justify-center">
                <span className="text-[13px] font-bold text-gray-700">Phác đồ</span>
                <span className="text-gray-400 text-[10px] border border-gray-300 rounded-full w-3.5 h-3.5 flex items-center justify-center">i</span>
              </div>
              <span className="text-[13px] font-bold text-gray-700 hidden md:block text-center">Số lượng</span>
              <span className="text-[13px] font-bold text-gray-700 text-right">Đơn giá</span>
            </div>
          )}

          {/* Vaccine items */}
          <div className="px-6 divide-y divide-dashed divide-gray-200 overflow-y-auto custom-scrollbar flex-1">
            {selected?.items?.map((item, idx) => (
              <div key={idx} className="py-2.5">
                {/* Disease group title */}
                <div className="text-[14px] font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#007a8c] flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>{item.diseaseName || 'Nhiều nguyên nhân'}</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_100px_100px_120px] gap-3 items-center">
                  {/* Vaccine Dropdown / Display */}
                  <div className="flex-1">
                    {(() => {
                      const disease = item.vaccine?.disease;
                      const alts = disease ? vaccines.filter((v: any) => v.disease === disease && v.status === 'in_stock') : [];
                      const isDropdown = alts.length > 1;

                      return isDropdown ? (
                        <div className="relative border border-gray-200 rounded-lg bg-white hover:border-[#007a8c] transition-colors cursor-pointer">
                          <select
                            className="w-full appearance-none bg-transparent py-1.5 pl-3 pr-8 text-[13px] font-semibold text-gray-700 uppercase truncate cursor-pointer focus:outline-none"
                            value={String(selectedAlternatives[idx]?.id || item.vaccine?.id || '')}
                            onChange={(e) => {
                              const match = alts.find((a: any) => String(a.id) === String(e.target.value));
                              if (match && String(match.id) !== String(item.vaccine?.id)) {
                                setSelectedAlternatives(prev => ({ ...prev, [idx]: match }));
                              } else {
                                const newObj = { ...selectedAlternatives };
                                delete newObj[idx];
                                setSelectedAlternatives(newObj);
                              }
                            }}
                          >
                            <option value={String(item.vaccine?.id || '')}>{item.vaccine?.origin ? `${item.vaccine.origin} - ` : ''}{item.vaccine?.name}</option>
                            {alts.filter((a: any) => String(a.id) !== String(item.vaccine?.id)).map((alt: any) => (
                              <option key={alt.id} value={String(alt.id)}>{alt.origin ? `${alt.origin} - ` : ''}{alt.name}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <ChevronDown size={16} className="text-gray-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center bg-gray-50">
                          <div className="flex items-center gap-2 overflow-hidden w-full">
                            <span className="text-[13px] font-semibold text-gray-700 uppercase truncate">
                              {item.vaccine?.origin ? `${item.vaccine.origin} - ` : ''}{item.vaccine?.name}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  {/* Protocol */}
                  <p className="text-[13px] text-gray-600 hidden md:block text-center">
                    {item.protocol || `${item.doses} Liều`}
                  </p>
                  {/* Quantity */}
                  <div className="hidden md:flex justify-center">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button 
                        onClick={() => handleDoseChange(idx, -1, item.doses || 1)}
                        className="px-2.5 py-1 text-gray-400 hover:bg-gray-50 transition-colors"
                      >
                        —
                      </button>
                      <span className="px-3 text-[13px] font-semibold text-gray-700 border-x border-gray-100">
                        {customDoses[idx] !== undefined ? customDoses[idx] : (item.doses || 1)}
                      </span>
                      <button 
                        onClick={() => handleDoseChange(idx, 1, item.doses || 1)}
                        className="px-2.5 py-1 text-gray-400 hover:bg-gray-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Price */}
                  <div className="text-right">
                    {(() => {
                      const alt = selectedAlternatives[idx];
                      const displayPrice = alt ? alt.price : item.unitPrice;
                      return displayPrice ? (
                        <p className="text-[14px] font-bold text-gray-800">
                          {formatPrice(displayPrice)}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">—</p>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto border-t border-gray-100 px-6 py-5 bg-white">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
              {/* CTA buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <a
                  href={`tel:${phoneNumber}`}
                  className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 bg-[#007a8c] hover:bg-[#006675] text-white font-bold px-6 py-2.5 rounded-full transition-colors text-[15px]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><circle cx="8" cy="15" r="1.5"></circle><circle cx="12" cy="15" r="1.5"></circle><circle cx="16" cy="15" r="1.5"></circle></svg>
                  Đặt hẹn
                </a>
                
              </div>

              {/* Total price */}
              <div className="text-right flex-shrink-0 flex flex-col items-end">
                
                <p className="text-[22px] leading-none font-bold text-gray-800">
                  {selected ? formatPrice(getDynamicPrice()) : ''}
                </p>
                
              </div>
            </div>

            {/* Note */}
            <div className="mt-6 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-[14px] mt-0.5 flex-shrink-0">💡</span>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  Quý khách có thể bỏ chọn các Liều đã tiêm để tùy chỉnh gói tiêm phù hợp với nhu cầu.
                </p>
              </div>
              
            </div>
          </div>
        </div>

      </div>
      )}
    </div>
  );
}
