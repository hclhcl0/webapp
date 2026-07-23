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

  const { docs: packages } = await payload.find({
    collection: 'vaccine-packages',
    where: { isActive: { equals: true } },
    sort: 'order',
    depth: 2,
    limit,
  });

  const { docs: vaccines } = await payload.find({
    collection: 'vaccines',
    where: { status: { equals: 'in_stock' } },
    limit: 500,
  });

  let phoneNumber = '0236 3890 407';
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 });
    if ((settings as any)?.headerHotlinePhone) {
      phoneNumber = (settings as any).headerHotlinePhone;
    }
  } catch {
    // fallback
  }

  if (!packages || packages.length === 0) return null;

  return (
    <section className="w-full pt-6 pb-20 bg-[#f0f8f9] relative">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">

        {/* ── Header ── */}
        <div className="flex flex-col items-center justify-center text-center gap-1 mb-5 relative">
          <div className="relative z-10">
            <h2 className="text-[22px] md:text-[28px] font-bold text-[#00a4ff] pb-1 leading-relaxed">
              {title}
            </h2>
          </div>
          {subtitle && <p className="text-gray-500 text-sm max-w-xl mx-auto">{subtitle}</p>}
        </div>



        {/* ── Main UI (compact mode) ── */}
        <div className="relative z-10 max-w-[1100px] mx-auto mt-4">
          {/* Decorative glowing blobs */}
          <div className="absolute top-1/2 left-0 -translate-x-1/3 -translate-y-1/2 w-64 h-64 bg-[#33b5ff] rounded-full blur-[80px] opacity-25 -z-10 animate-pulse-slow" />
          <div className="absolute top-1/2 right-0 translate-x-1/3 -translate-y-1/2 w-80 h-80 bg-[#00a4ff] rounded-full blur-[100px] opacity-20 -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }} />
          
          <VaccinePackageUI
            packages={packages as any}
            vaccines={vaccines as any}
            phoneNumber={phoneNumber}
            compact
          />
      </div>
      </div>

      {/* Shape Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[70px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M600,120 C268.6,120 0,0 0,0 L0,120 L1200,120 L1200,0 C1200,0 931.4,120 600,120 Z"
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
}
