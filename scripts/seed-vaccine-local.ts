/**
 * Seed dữ liệu vắc xin dùng Payload Local API
 * Chạy: npx tsx --tsconfig tsconfig.json scripts/seed-vaccine-local.ts
 */
import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';

const VACCINES = [
  { name: 'INFANRIX HEXA', disease: '6 trong 1 (Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, Viêm gan B)', origin: 'Bỉ', price: 1042204, targetGroup: 'Trẻ từ 2 tháng tuổi' },
  { name: 'HEXAXIM', disease: '6 trong 1 (Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, Viêm gan B)', origin: 'Pháp', price: 1013150, targetGroup: 'Trẻ từ 6 tuần tuổi' },
  { name: 'ROTATEQ', disease: 'Tiêu chảy do Rotavirus', origin: 'Mỹ', price: 628820, targetGroup: 'Trẻ từ 6–32 tuần tuổi' },
  { name: 'ROTARIX', disease: 'Tiêu chảy do Rotavirus', origin: 'Bỉ', price: 860335, targetGroup: 'Trẻ từ 6 tuần tuổi' },
  { name: 'ROTAVIN', disease: 'Tiêu chảy do Rotavirus', origin: 'Việt Nam', price: 433280, targetGroup: 'Trẻ từ 6 tuần tuổi' },
  { name: 'SYNFLORIX 10', disease: 'Phế cầu (10 chủng)', origin: 'Bỉ', price: 926400, targetGroup: 'Trẻ từ 6 tuần đến 5 tuổi' },
  { name: 'PREVENAR 13', disease: 'Phế cầu (13 chủng)', origin: 'Bỉ', price: 1173800, targetGroup: 'Trẻ từ 2 tháng tuổi' },
  { name: 'VAXNEUVANCE 15', disease: 'Phế cầu (15 chủng)', origin: 'Ai-len', price: 1496500, targetGroup: 'Trẻ từ 6 tuần và người lớn' },
  { name: 'IVACFLU-S', disease: 'Cúm mùa', origin: 'Việt Nam', price: 245600, targetGroup: 'Từ 6 tháng tuổi' },
  { name: 'GCFLU QUADRIVALENT', disease: 'Cúm mùa (4 chủng)', origin: 'Hàn Quốc', price: 355640, targetGroup: 'Từ 6 tháng tuổi' },
  { name: 'INFLUVAC TETRA', disease: 'Cúm mùa (4 chủng)', origin: 'Hà Lan', price: 364500, targetGroup: 'Từ 6 tháng tuổi' },
  { name: 'VAXIGRIP TETRA', disease: 'Cúm mùa (4 chủng)', origin: 'Pháp', price: 370500, targetGroup: 'Từ 6 tháng tuổi' },
  { name: 'MENACTRA – ACYW', disease: 'Não mô cầu nhóm A, C, Y, W', origin: 'Mỹ', price: 1198500, targetGroup: 'Từ 9 tháng đến 55 tuổi' },
  { name: 'BEXSERO – nhóm B', disease: 'Não mô cầu nhóm B', origin: 'Ý', price: 1626426, targetGroup: 'Từ 2 tháng tuổi' },
  { name: 'VA-MENGOC-BC – nhóm BC', disease: 'Não mô cầu nhóm B, C', origin: 'Cuba', price: 271892, targetGroup: 'Từ 6 tháng đến 45 tuổi' },
  { name: 'PRIORIX', disease: 'Sởi – Quai bị – Rubella', origin: 'Bỉ', price: 370500, targetGroup: 'Từ 12 tháng tuổi' },
  { name: 'M-M-R II', disease: 'Sởi – Quai bị – Rubella', origin: 'Mỹ', price: 317756, targetGroup: 'Từ 12 tháng tuổi' },
  { name: 'Vắc xin Sởi-Quai bị-Rubella', disease: 'Sởi – Quai bị – Rubella', origin: 'Ấn Độ', price: 275682, targetGroup: 'Từ 12 tháng tuổi' },
  { name: 'IMOJEV', disease: 'Viêm não Nhật Bản', origin: 'Thái Lan', price: 795718, targetGroup: 'Từ 9 tháng tuổi' },
  { name: 'JEVAX', disease: 'Viêm não Nhật Bản', origin: 'Việt Nam', price: 160140, targetGroup: 'Từ 1 đến 15 tuổi' },
  { name: 'JEEV 3mcg', disease: 'Viêm não Nhật Bản', origin: 'Ấn Độ', price: 369500, targetGroup: 'Từ 1 tuổi' },
  { name: 'JEEV 6mcg', disease: 'Viêm não Nhật Bản', origin: 'Ấn Độ', price: 479750, targetGroup: 'Từ 12 tuổi' },
  { name: 'VARILRIX', disease: 'Thủy đậu', origin: 'Bỉ', price: 936664, targetGroup: 'Từ 9 tháng tuổi' },
  { name: 'VARIVAX', disease: 'Thủy đậu', origin: 'Mỹ', price: 972695, targetGroup: 'Từ 12 tháng tuổi' },
  { name: 'QDENGA', disease: 'Sốt xuất huyết Dengue', origin: 'Đức', price: 1060836, targetGroup: 'Từ 4 đến 60 tuổi' },
  { name: 'TYPHIMVI', disease: 'Thương hàn', origin: 'Pháp', price: 270879, targetGroup: 'Từ 2 tuổi' },
  { name: 'MORCVAX', disease: 'Tả', origin: 'Việt Nam', price: 168885, targetGroup: 'Từ 2 tuổi' },
  { name: 'HAVAX', disease: 'Viêm gan A', origin: 'Việt Nam', price: 209270, targetGroup: 'Từ 12 tháng tuổi' },
  { name: 'AVAXIM 80 U', disease: 'Viêm gan A', origin: 'Pháp', price: 554644, targetGroup: 'Từ 12 tháng tuổi' },
  { name: 'TWINRIX', disease: 'Viêm gan A và B', origin: 'Bỉ', price: 607422, targetGroup: 'Từ 1 tuổi' },
  { name: 'Hebebiovac 1ml – viêm gan B', disease: 'Viêm gan B', origin: 'Cuba', price: 176405, targetGroup: 'Từ sơ sinh' },
  { name: 'Gene Hbvax 1ml – viêm gan B', disease: 'Viêm gan B', origin: 'Việt Nam', price: 173108, targetGroup: 'Từ sơ sinh' },
  { name: 'GARDASIL 9', disease: 'HPV (9 chủng)', origin: 'Mỹ', price: 2823350, targetGroup: 'Từ 9 đến 45 tuổi' },
  { name: 'GARDASIL (4)', disease: 'HPV (4 chủng)', origin: 'Mỹ', price: 1606100, targetGroup: 'Từ 9 đến 45 tuổi' },
  { name: 'Uốn ván hấp phụ (TT)', disease: 'Uốn ván', origin: 'Việt Nam', price: 112762, targetGroup: 'Người lớn' },
  { name: 'Uốn ván bạch hầu (Td)', disease: 'Uốn ván – Bạch hầu', origin: 'Việt Nam', price: 127945, targetGroup: 'Từ 7 tuổi' },
  { name: 'ADACEL', disease: 'Bạch hầu – Ho gà – Uốn ván (Tdap)', origin: 'Canada', price: 656295, targetGroup: 'Từ 10 đến 64 tuổi' },
  { name: 'BOOSTRIX', disease: 'Bạch hầu – Ho gà – Uốn ván (Tdap)', origin: 'Bỉ', price: 694500, targetGroup: 'Từ 4 tuổi' },
  { name: 'PNEUMOVAX 23', disease: 'Phế cầu (23 chủng)', origin: 'Mỹ', price: 917268, targetGroup: 'Người cao tuổi, từ 50 tuổi' },
  { name: 'SHINGRIX', disease: 'Zona thần kinh (Herpes Zoster)', origin: 'Bỉ', price: 3491885, targetGroup: 'Từ 50 tuổi' },
];

const PACKAGES_DEF = [
  {
    name: 'Gói Vắc Xin Trẻ Em Dưới 1 Tuổi',
    targetGroup: '0 – 12 tháng tuổi',
    packageType: 'by_age', order: 1, isFeatured: true,
    items: [
      { vn: 'HEXAXIM', dn: '6 trong 1', doses: 3, protocol: '3 Liều' },
      { vn: 'ROTARIX', dn: 'Rota (Tiêu chảy)', doses: 2, protocol: '2 Liều' },
      { vn: 'SYNFLORIX 10', dn: 'Phế cầu', doses: 3, protocol: '3 Liều' },
      { vn: 'IVACFLU-S', dn: 'Cúm', doses: 2, protocol: '2 Liều' },
      { vn: 'BEXSERO – nhóm B', dn: 'Não mô cầu nhóm B', doses: 2, protocol: '2 Liều' },
      { vn: 'MENACTRA – ACYW', dn: 'Não mô cầu ACYW', doses: 1, protocol: '1 Liều' },
      { vn: 'PRIORIX', dn: 'Sởi – Quai bị – Rubella', doses: 1, protocol: '1 Liều' },
      { vn: 'IMOJEV', dn: 'Viêm não Nhật Bản', doses: 1, protocol: '1 Liều' },
      { vn: 'VARILRIX', dn: 'Thủy đậu', doses: 1, protocol: '1 Liều' },
    ],
  },
  {
    name: 'Gói Vắc Xin Trẻ Em Trên 1 Tuổi',
    targetGroup: 'Từ 1 tuổi trở lên',
    packageType: 'by_age', order: 2,
    items: [
      { vn: 'M-M-R II', dn: 'Sởi – Quai bị – Rubella', doses: 2, protocol: '2 Liều' },
      { vn: 'JEVAX', dn: 'Viêm não Nhật Bản', doses: 3, protocol: '3 Liều' },
      { vn: 'VARIVAX', dn: 'Thủy đậu', doses: 1, protocol: '1 Liều' },
      { vn: 'QDENGA', dn: 'Sốt xuất huyết', doses: 2, protocol: '2 Liều' },
      { vn: 'TYPHIMVI', dn: 'Thương hàn', doses: 1, protocol: '1 Liều' },
      { vn: 'MORCVAX', dn: 'Tả', doses: 2, protocol: '2 Liều' },
      { vn: 'HAVAX', dn: 'Viêm gan A', doses: 2, protocol: '2 Liều' },
    ],
  },
  {
    name: 'Gói Vắc Xin Người Chuẩn Bị Kết Hôn',
    targetGroup: 'Người chuẩn bị kết hôn',
    packageType: 'by_target', order: 3,
    items: [
      { vn: 'M-M-R II', dn: 'Sởi – Quai bị – Rubella', doses: 1, protocol: '1 Liều' },
      { vn: 'VARIVAX', dn: 'Thủy đậu', doses: 2, protocol: '2 Liều' },
      { vn: 'QDENGA', dn: 'Sốt xuất huyết', doses: 2, protocol: '2 Liều' },
      { vn: 'TWINRIX', dn: 'Viêm gan A+B', doses: 3, protocol: '3 Liều' },
      { vn: 'GARDASIL 9', dn: 'HPV', doses: 3, protocol: '3 Liều' },
      { vn: 'IVACFLU-S', dn: 'Cúm', doses: 1, protocol: '1 Liều/năm' },
      { vn: 'Uốn ván hấp phụ (TT)', dn: 'Uốn ván', doses: 3, protocol: '3 Liều' },
    ],
  },
  {
    name: 'Gói Vắc Xin Phụ Nữ Có Thai',
    targetGroup: 'Phụ nữ mang thai',
    packageType: 'by_target', order: 4,
    items: [
      { vn: 'GCFLU QUADRIVALENT', dn: 'Cúm', doses: 1, protocol: '1 Liều/năm' },
      { vn: 'Uốn ván hấp phụ (TT)', dn: 'Uốn ván / Bạch hầu', doses: 2, protocol: '2 Liều' },
      { vn: 'ADACEL', dn: 'Bạch hầu – Ho gà – Uốn ván (Tdap)', doses: 1, protocol: '1 Liều' },
    ],
  },
  {
    name: 'Gói Vắc Xin Người Cao Tuổi & Có Bệnh Nền',
    targetGroup: 'Người cao tuổi và người có bệnh nền',
    packageType: 'by_target', order: 5,
    items: [
      { vn: 'GCFLU QUADRIVALENT', dn: 'Cúm', doses: 1, protocol: '1 Liều/năm' },
      { vn: 'TWINRIX', dn: 'Viêm gan A+B', doses: 3, protocol: '3 Liều' },
      { vn: 'PNEUMOVAX 23', dn: 'Phế cầu', doses: 1, protocol: '1 Liều' },
      { vn: 'SHINGRIX', dn: 'Zona thần kinh', doses: 2, protocol: '2 Liều' },
      { vn: 'ADACEL', dn: 'Bạch hầu – Ho gà – Uốn ván', doses: 1, protocol: '1 Liều' },
      { vn: 'QDENGA', dn: 'Sốt xuất huyết', doses: 2, protocol: '2 Liều' },
    ],
  },
];

async function main() {
  const payload = await getPayload({ config: configPromise });

  // Xoá dữ liệu cũ nếu có
  console.log('🗑️  Xoá dữ liệu cũ...');
  const oldPkgs = await payload.find({ collection: 'vaccine-packages', limit: 100 });
  for (const p of oldPkgs.docs) await payload.delete({ collection: 'vaccine-packages', id: p.id });

  const oldVacs = await payload.find({ collection: 'vaccines', limit: 200 });
  for (const v of oldVacs.docs) await payload.delete({ collection: 'vaccines', id: v.id });

  // 1. Tạo vaccines
  console.log(`\n📌 Tạo ${VACCINES.length} vắc xin...`);
  const vaccineMap: Record<string, number> = {};
  for (const v of VACCINES) {
    const doc = await payload.create({
      collection: 'vaccines',
      data: { name: v.name, disease: v.disease, origin: v.origin, price: v.price, targetGroup: v.targetGroup, status: 'in_stock' },
    });
    vaccineMap[v.name] = doc.id as number;
    process.stdout.write('.');
  }
  console.log(`\n✅ Đã tạo ${Object.keys(vaccineMap).length} vắc xin\n`);

  // 2. Tạo packages
  console.log(`📦 Tạo ${PACKAGES_DEF.length} gói vắc xin...`);
  for (const pkg of PACKAGES_DEF) {
    const items = pkg.items
      .map(item => ({
        vaccine: vaccineMap[item.vn],
        diseaseName: item.dn,
        doses: item.doses,
        protocol: item.protocol,
        unitPrice: VACCINES.find(v => v.name === item.vn)?.price,
      }))
      .filter(i => i.vaccine);

    let total = 0;
    for (const item of pkg.items) {
      const vac = VACCINES.find(v => v.name === item.vn);
      if (vac) total += vac.price * item.doses;
    }

    await payload.create({
      collection: 'vaccine-packages',
      data: {
        name: pkg.name,
        targetGroup: pkg.targetGroup,
        packageType: pkg.packageType,
        order: pkg.order,
        isFeatured: (pkg as any).isFeatured || false,
        isActive: true,
        originalPrice: total,
        discountPrice: Math.round(total * 0.9),
        discountLabel: 'Giá tham khảo tại CDC Đà Nẵng',
        items,
      },
    });
    console.log(`  ✅ ${pkg.name}`);
  }

  console.log('\n🎉 Hoàn tất seed dữ liệu!');
  process.exit(0);
}

main().catch(err => { console.error('💥', err); process.exit(1); });
