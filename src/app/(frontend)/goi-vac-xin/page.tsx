import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { VaccinePackageUI } from '@/components/VaccinePackages/VaccinePackageUI';
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
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <VaccinePackageUI
          packages={packages as any}
          phoneNumber={phoneNumber}
        />
      </div>
    </main>
  );
}
