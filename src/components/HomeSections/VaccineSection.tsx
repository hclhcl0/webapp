import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { VaccinePackageUI } from '@/components/VaccinePackages/VaccinePackageUI';
import Link from 'next/link';

interface Props {
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewAll?: boolean;
}

export async function VaccineSection({
  title = 'Gói Vắc Xin Bảo Vệ Toàn Diện',
  subtitle,
  limit = 20,
  showViewAll = true,
}: Props) {
  const payload = await getPayload({ config: configPromise });

  // Fetch vaccine packages
  const { docs: packages } = await payload.find({
    collection: 'vaccine-packages',
    where: { isActive: { equals: true } },
    sort: 'order',
    depth: 2,
    limit,
  });

  // Fetch all active vaccines (for alternative dropdowns inside each package)
  const { docs: vaccines } = await payload.find({
    collection: 'vaccines',
    where: { status: { equals: 'in_stock' } },
    limit: 500,
  });

  // Fetch phone number from site settings
  let phoneNumber = '0236 3890 407';
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 });
    if ((settings as any)?.hotline?.phone) {
      phoneNumber = (settings as any).hotline.phone;
    }
  } catch {
    // fallback to default
  }

  if (!packages || packages.length === 0) return null;

  return (
    <section className="w-full py-8 bg-[#f0f8f9]">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✨</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#007a8c] to-[#00b4d8]">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-gray-500 text-sm ml-9">{subtitle}</p>
            )}
            {/* Underline accent */}
            <div className="ml-9 mt-1 w-24 h-1 rounded-full bg-gradient-to-r from-[#007a8c] to-[#00b4d8]" />
          </div>

          {showViewAll && (
            <Link
              href="/goi-vac-xin"
              className="flex-shrink-0 flex items-center gap-1.5 text-sm font-bold text-[#007a8c] hover:text-[#005f6b] transition-colors border border-[#007a8c]/30 hover:border-[#007a8c] rounded-full px-4 py-2 bg-white hover:bg-[#f0f9fa]"
            >
              Xem chi tiết
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          )}
        </div>

        {/* Benefits bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { icon: '🗓️', title: 'Miễn phí nhắc lịch hẹn', sub: 'Chính xác và khoa học cho cả gia đình' },
            { icon: '🛡️', title: 'Cam kết giữ giá vắc xin', sub: 'Suốt thời gian tiêm theo phác đồ' },
            { icon: '💉', title: 'Cam kết luôn đủ vắc xin', sub: 'Không lo hàng khan hiếm' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-[#e0f2f5]">
              <span className="text-2xl flex-shrink-0">{b.icon}</span>
              <div>
                <p className="font-bold text-[13px] text-gray-800">{b.title}</p>
                <p className="text-[11px] text-gray-500">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Package UI */}
        <VaccinePackageUI
          packages={packages as any}
          vaccines={vaccines as any}
          phoneNumber={phoneNumber}
        />
      </div>
    </section>
  );
}
