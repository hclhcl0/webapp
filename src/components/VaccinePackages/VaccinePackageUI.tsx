"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Phone, CheckCircle, ChevronRight, Shield, Clock, Package } from "lucide-react";

interface VaccineItem {
  id: string;
  vaccine: { name: string; origin?: string };
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
  phoneNumber: string;
}

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export function VaccinePackageUI({ packages, phoneNumber }: Props) {
  const featured = packages.find((p) => p.isFeatured) || packages[0];
  const [selected, setSelected] = useState<VaccinePackage | null>(featured || null);

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
        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
          ${isActive
            ? "border-[#1250dc] bg-[#eff6ff] shadow-sm"
            : "border-gray-100 bg-white hover:border-[#1250dc]/40 hover:bg-blue-50/30"
          }`}
      >
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          {pkg.image?.url ? (
            <Image src={pkg.image.url} alt={pkg.name} width={56} height={56} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">💉</div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-[13px] leading-tight ${isActive ? "text-[#1250dc]" : "text-gray-800"}`}>
            {pkg.name}
          </p>
          {pkg.discountLabel && (
            <span className="inline-block mt-1 text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
              {pkg.discountLabel}
            </span>
          )}
        </div>
        {isActive && <ChevronRight size={18} className="text-[#1250dc] flex-shrink-0" />}
      </button>
    );
  };

  return (
    <div className="w-full">
      {/* ─── Main Content ─────────────────────────────────────────── */}
      {packages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-16 text-center">
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
      <div className="flex flex-col lg:flex-row gap-4">
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
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
        <div className="flex-1 bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-xl font-black text-gray-800 uppercase">{selected?.name}</h2>
            {selected?.description && (
              <p className="text-sm text-gray-500 mt-1">{selected.description}</p>
            )}
          </div>

          {/* Table header */}
          {selected?.items && selected.items.length > 0 && (
            <div className="px-6 py-3 grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_120px_160px] gap-4 border-b border-gray-100 bg-gray-50/60">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-[#1250dc]" />
                <span className="text-xs font-bold text-gray-600">Vắc xin</span>
              </div>
              <span className="text-xs font-bold text-gray-600 hidden md:block">Phác đồ</span>
              <span className="text-xs font-bold text-gray-600 text-right">Đơn giá</span>
            </div>
          )}

          {/* Vaccine items */}
          <div className="px-6 py-2 divide-y divide-gray-50">
            {selected?.items?.map((item, idx) => (
              <div key={idx} className="py-3">
                {/* Disease group title */}
                {item.diseaseName && (
                  <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-[#1250dc]" />
                    {item.diseaseName}
                  </p>
                )}
                <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_120px_160px] gap-4 items-center ml-4">
                  {/* Vaccine name */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg" title={item.vaccine?.name?.split(" - ")[0]}>🇻🇳</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 leading-tight">
                        {item.vaccine?.name}
                      </p>
                      {item.vaccine?.origin && (
                        <p className="text-xs text-gray-400">{item.vaccine.origin}</p>
                      )}
                    </div>
                  </div>
                  {/* Protocol */}
                  <p className="text-sm text-gray-600 hidden md:block">
                    {item.protocol || `${item.doses} Liều`}
                  </p>
                  {/* Price */}
                  <div className="text-right">
                    {item.unitPrice ? (
                      <>
                        <p className="text-sm font-bold text-gray-800">
                          {formatPrice(item.unitPrice)}
                        </p>
                        {item.originalUnitPrice && item.originalUnitPrice > item.unitPrice && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(item.originalUnitPrice)}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">—</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* CTA buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href={`tel:${phoneNumber}`}
                  className="inline-flex items-center gap-2 bg-[#1250dc] hover:bg-[#1e3a8a] text-white font-bold px-5 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Phone size={17} />
                  Đặt hẹn ngay
                </a>
                <a
                  href={`tel:${phoneNumber}`}
                  className="inline-flex items-center gap-2 border-2 border-[#1250dc] text-[#1250dc] hover:bg-[#1250dc] hover:text-white font-bold px-5 py-3 rounded-xl transition-all duration-200"
                >
                  {phoneNumber}
                </a>
              </div>

              {/* Total price */}
              <div className="text-right flex-shrink-0">
                {selected?.discountLabel && (
                  <span className="inline-block mb-1 text-xs font-bold text-white bg-orange-500 rounded-full px-2.5 py-0.5">
                    {selected.discountLabel}
                  </span>
                )}
                <p className="text-2xl font-black text-[#003049]">
                  {selected ? formatPrice(selected.discountPrice) : ''}
                </p>
                {selected?.originalPrice && selected.originalPrice > selected.discountPrice && (
                  <p className="text-sm text-gray-400 line-through">
                    {formatPrice(selected.originalPrice)}
                  </p>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="mt-4 space-y-1.5">
              <p className="text-xs text-gray-500 flex items-start gap-1.5">
                <span className="text-[#f4a261] mt-0.5 flex-shrink-0">💡</span>
                Quý khách có thể bỏ chọn các liều đã tiêm để tuỳ chỉnh gói tiêm phù hợp với nhu cầu.
              </p>
              <p className="text-xs text-gray-500 flex items-start gap-1.5">
                <span className="text-[#f4a261] mt-0.5 flex-shrink-0">💡</span>
                Giá tạm tính trên đây chưa bao gồm phí quản lý. Giá thực tế tại trung tâm sẽ được thông báo khi đặt hẹn.
              </p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
