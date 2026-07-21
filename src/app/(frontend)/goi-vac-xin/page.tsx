import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { VaccineMainUI } from '@/components/VaccinePackages/VaccineMainUI';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gói Vắc Xin Bảo Vệ Toàn Diện | CDC Đà Nẵng',
  description: 'Các gói vắc xin combo theo độ tuổi và đối tượng tại CDC Đà Nẵng. Cam kết giữ giá, luôn đủ hàng và miễn phí nhắc lịch hẹn.',
};

export const revalidate = 300; // 5 phút

export default async function GoiVacXinPage() {
  const payload = await getPayload({ config: configPromise });

  // Fetch vaccine packages
  const { docs: packages } = await payload.find({
    collection: 'vaccine-packages',
    where: { isActive: { equals: true } },
    sort: 'order',
    depth: 2,
    limit: 50,
  });

  // Fetch all active vaccines for the disease tab
  const { docs: vaccines } = await payload.find({
    collection: 'vaccines',
    where: { status: { equals: 'in_stock' } },
    limit: 1000,
  });

  // Fetch banners for vaccine page
  const { docs: banners } = await payload.find({
    collection: 'banners',
    where: {
      and: [
        { isActive: { equals: true } },
        { position: { equals: 'vaccine_slider' } }
      ]
    },
    sort: 'order',
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

  return (
    <main className="bg-gray-50 min-h-screen pb-12">
      <VaccineMainUI
        packages={packages as any}
        vaccines={vaccines as any}
        banners={banners as any}
        phoneNumber={phoneNumber}
      />
    </main>
  );
}
