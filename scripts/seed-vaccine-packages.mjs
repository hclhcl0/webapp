/**
 * Seed script: Nhập dữ liệu Vắc xin & Gói Vắc Xin từ hình ảnh CDC Đà Nẵng
 * Chạy: node scripts/seed-vaccine-packages.mjs
 */

const BASE_URL = 'http://localhost:3000';
const EMAIL = process.env.PAYLOAD_SEED_EMAIL || 'hclhcl0@gmail.com';
const PASSWORD = process.env.PAYLOAD_SEED_PASS || '123456';

// ─── Danh sách tất cả vắc xin ───────────────────────────────────────────────
const VACCINES = [
  // 6 trong 1
  { name: 'INFANRIX HEXA', disease: '6 trong 1 (Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, Viêm gan B)', origin: 'Bỉ', price: 1042204, targetGroup: 'Trẻ từ 2 tháng tuổi' },
  { name: 'HEXAXIM', disease: '6 trong 1 (Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, Viêm gan B)', origin: 'Pháp', price: 1013150, targetGroup: 'Trẻ từ 6 tuần tuổi' },
  // Rota
  { name: 'ROTATEQ', disease: 'Tiêu chảy do Rotavirus', origin: 'Mỹ', price: 628820, targetGroup: 'Trẻ từ 6-32 tuần tuổi' },
  { name: 'ROTARIX', disease: 'Tiêu chảy do Rotavirus', origin: 'Bỉ', price: 860335, targetGroup: 'Trẻ từ 6 tuần tuổi' },
  { name: 'ROTAVIN', disease: 'Tiêu chảy do Rotavirus', origin: 'Việt Nam', price: 433280, targetGroup: 'Trẻ từ 6 tuần tuổi' },
  // Phế cầu
  { name: 'SYNFLORIX 10', disease: 'Phế cầu (10 chủng)', origin: 'Bỉ', price: 926400, targetGroup: 'Trẻ từ 6 tuần đến 5 tuổi' },
  { name: 'PREVENAR 13', disease: 'Phế cầu (13 chủng)', origin: 'Bỉ', price: 1173800, targetGroup: 'Trẻ từ 2 tháng tuổi' },
  { name: 'VAXNEUVANCE 15', disease: 'Phế cầu (15 chủng)', origin: 'Ai-len', price: 1496500, targetGroup: 'Trẻ từ 6 tuần tuổi và người lớn' },
  // Cúm
  { name: 'IVACFLU-S', disease: 'Cúm mùa', origin: 'Việt Nam', price: 245600, targetGroup: 'Từ 6 tháng tuổi trở lên' },
  { name: 'GCFLU QUADRIVALENT', disease: 'Cúm mùa (4 chủng)', origin: 'Hàn Quốc', price: 355640, targetGroup: 'Từ 6 tháng tuổi trở lên' },
  { name: 'INFLUVAC TETRA', disease: 'Cúm mùa (4 chủng)', origin: 'Hà Lan', price: 364500, targetGroup: 'Từ 6 tháng tuổi trở lên' },
  { name: 'VAXIGRIP TETRA', disease: 'Cúm mùa (4 chủng)', origin: 'Pháp', price: 370500, targetGroup: 'Từ 6 tháng tuổi trở lên' },
  // Não mô cầu
  { name: 'MENACTRA – ACYW', disease: 'Viêm màng não do Não mô cầu nhóm A, C, Y, W', origin: 'Mỹ', price: 1198500, targetGroup: 'Từ 9 tháng đến 55 tuổi' },
  { name: 'BEXSERO – nhóm B', disease: 'Viêm màng não do Não mô cầu nhóm B', origin: 'Ý', price: 1626426, targetGroup: 'Từ 2 tháng tuổi' },
  { name: 'VA-MENGOC-BC – nhóm BC', disease: 'Viêm màng não do Não mô cầu nhóm B, C', origin: 'Cuba', price: 271892, targetGroup: 'Từ 6 tháng đến 45 tuổi' },
  // Sởi - Quai bị - Rubella
  { name: 'PRIORIX', disease: 'Sởi – Quai bị – Rubella', origin: 'Bỉ', price: 370500, targetGroup: 'Từ 12 tháng tuổi' },
  { name: 'M-M-R II', disease: 'Sởi – Quai bị – Rubella', origin: 'Mỹ', price: 317756, targetGroup: 'Từ 12 tháng tuổi' },
  { name: 'Vắc xin Sởi-Quai bị-Rubella', disease: 'Sởi – Quai bị – Rubella', origin: 'Ấn Độ', price: 275682, targetGroup: 'Từ 12 tháng tuổi' },
  // Viêm não Nhật Bản
  { name: 'IMOJEV', disease: 'Viêm não Nhật Bản', origin: 'Thái Lan', price: 795718, targetGroup: 'Từ 9 tháng tuổi' },
  { name: 'JEVAX', disease: 'Viêm não Nhật Bản', origin: 'Việt Nam', price: 160140, targetGroup: 'Từ 1 đến 15 tuổi' },
  { name: 'JEEV 3mcg', disease: 'Viêm não Nhật Bản', origin: 'Ấn Độ', price: 369500, targetGroup: 'Từ 1 tuổi trở lên' },
  { name: 'JEEV 6mcg', disease: 'Viêm não Nhật Bản', origin: 'Ấn Độ', price: 479750, targetGroup: 'Từ 12 tuổi trở lên' },
  // Thủy đậu
  { name: 'VARILRIX', disease: 'Thủy đậu', origin: 'Bỉ', price: 936664, targetGroup: 'Từ 9 tháng tuổi' },
  { name: 'VARIVAX', disease: 'Thủy đậu', origin: 'Mỹ', price: 972695, targetGroup: 'Từ 12 tháng tuổi' },
  // Sốt xuất huyết
  { name: 'QDENGA', disease: 'Sốt xuất huyết Dengue', origin: 'Đức', price: 1060836, targetGroup: 'Từ 4 đến 60 tuổi' },
  // Thương hàn
  { name: 'TYPHIMVI', disease: 'Thương hàn', origin: 'Pháp', price: 270879, targetGroup: 'Từ 2 tuổi trở lên' },
  // Tả
  { name: 'MORCVAX', disease: 'Tả', origin: 'Việt Nam', price: 168885, targetGroup: 'Từ 2 tuổi trở lên' },
  // Viêm gan A
  { name: 'HAVAX – viêm gan A', disease: 'Viêm gan A', origin: 'Việt Nam', price: 209270, targetGroup: 'Từ 12 tháng tuổi' },
  { name: 'AVAXIM 80 U – viêm gan A', disease: 'Viêm gan A', origin: 'Pháp', price: 554644, targetGroup: 'Từ 12 tháng tuổi' },
  // Viêm gan B
  { name: 'TWINRIX – viêm gan A+B', disease: 'Viêm gan A và B', origin: 'Bỉ', price: 607422, targetGroup: 'Từ 1 tuổi trở lên' },
  { name: 'Hebebiovac 1ml – viêm gan B', disease: 'Viêm gan B', origin: 'Cuba', price: 176405, targetGroup: 'Từ sơ sinh' },
  { name: 'Gene Hbvax 1ml – viêm gan B', disease: 'Viêm gan B', origin: 'Việt Nam', price: 173108, targetGroup: 'Từ sơ sinh' },
  // HPV
  { name: 'GARDASIL 9', disease: 'HPV (9 chủng)', origin: 'Mỹ', price: 2823350, targetGroup: 'Từ 9 đến 45 tuổi' },
  { name: 'GARDASIL (4)', disease: 'HPV (4 chủng)', origin: 'Mỹ', price: 1606100, targetGroup: 'Từ 9 đến 45 tuổi' },
  // Uốn ván
  { name: 'Uốn ván hấp phụ (TT)', disease: 'Uốn ván', origin: 'Việt Nam', price: 112762, targetGroup: 'Người lớn' },
  { name: 'Uốn ván bạch hầu (Td)', disease: 'Uốn ván – Bạch hầu', origin: 'Việt Nam', price: 127945, targetGroup: 'Từ 7 tuổi trở lên' },
  // Bạch hầu - Ho gà - Uốn ván (Tdap)
  { name: 'ADACEL', disease: 'Bạch hầu – Ho gà – Uốn ván (Tdap)', origin: 'Canada', price: 656295, targetGroup: 'Từ 10 đến 64 tuổi' },
  { name: 'BOOSTRIX', disease: 'Bạch hầu – Ho gà – Uốn ván (Tdap)', origin: 'Bỉ', price: 694500, targetGroup: 'Từ 4 tuổi trở lên' },
  // Phế cầu người lớn
  { name: 'PNEUMOVAX 23', disease: 'Phế cầu (23 chủng)', origin: 'Mỹ', price: 917268, targetGroup: 'Từ 2 tuổi trở lên, người cao tuổi' },
  // Zona thần kinh
  { name: 'SHINGRIX', disease: 'Zona thần kinh (Herpes Zoster)', origin: 'Bỉ', price: 3491885, targetGroup: 'Từ 50 tuổi trở lên' },
];

// ─── Cấu trúc gói vắc xin ────────────────────────────────────────────────────
const PACKAGES_DEF = [
  {
    name: 'Gói Vắc Xin Trẻ Em Dưới 1 Tuổi',
    targetGroup: '0 – 12 tháng tuổi',
    packageType: 'by_age',
    order: 1,
    isFeatured: true,
    items: [
      { vaccineName: 'HEXAXIM', diseaseName: '6 trong 1', doses: 3, protocol: '3 Liều' },
      { vaccineName: 'ROTARIX', diseaseName: 'Rota (Tiêu chảy)', doses: 2, protocol: '2 Liều' },
      { vaccineName: 'SYNFLORIX 10', diseaseName: 'Phế cầu', doses: 3, protocol: '3 Liều' },
      { vaccineName: 'IVACFLU-S', diseaseName: 'Cúm', doses: 2, protocol: '2 Liều' },
      { vaccineName: 'BEXSERO – nhóm B', diseaseName: 'Não mô cầu nhóm B', doses: 2, protocol: '2 Liều' },
      { vaccineName: 'MENACTRA – ACYW', diseaseName: 'Não mô cầu ACYW', doses: 1, protocol: '1 Liều' },
      { vaccineName: 'PRIORIX', diseaseName: 'Sởi – Quai bị – Rubella', doses: 1, protocol: '1 Liều' },
      { vaccineName: 'IMOJEV', diseaseName: 'Viêm não Nhật Bản', doses: 1, protocol: '1 Liều' },
      { vaccineName: 'VARILRIX', diseaseName: 'Thủy đậu', doses: 1, protocol: '1 Liều' },
    ],
  },
  {
    name: 'Gói Vắc Xin Trẻ Em Trên 1 Tuổi',
    targetGroup: 'Từ 1 tuổi trở lên',
    packageType: 'by_age',
    order: 2,
    items: [
      { vaccineName: 'M-M-R II', diseaseName: 'Sởi – Quai bị – Rubella', doses: 2, protocol: '2 Liều' },
      { vaccineName: 'JEVAX', diseaseName: 'Viêm não Nhật Bản', doses: 3, protocol: '3 Liều' },
      { vaccineName: 'VARIVAX', diseaseName: 'Thủy đậu', doses: 1, protocol: '1 Liều' },
      { vaccineName: 'QDENGA', diseaseName: 'Sốt xuất huyết', doses: 2, protocol: '2 Liều' },
      { vaccineName: 'TYPHIMVI', diseaseName: 'Thương hàn', doses: 1, protocol: '1 Liều' },
      { vaccineName: 'MORCVAX', diseaseName: 'Tả', doses: 2, protocol: '2 Liều' },
      { vaccineName: 'HAVAX – viêm gan A', diseaseName: 'Viêm gan A', doses: 2, protocol: '2 Liều' },
    ],
  },
  {
    name: 'Gói Vắc Xin Người Chuẩn Bị Kết Hôn',
    targetGroup: 'Người chuẩn bị kết hôn',
    packageType: 'by_target',
    order: 3,
    items: [
      { vaccineName: 'M-M-R II', diseaseName: 'Sởi – Quai bị – Rubella', doses: 1, protocol: '1 Liều' },
      { vaccineName: 'VARIVAX', diseaseName: 'Thủy đậu', doses: 2, protocol: '2 Liều' },
      { vaccineName: 'QDENGA', diseaseName: 'Sốt xuất huyết', doses: 2, protocol: '2 Liều' },
      { vaccineName: 'HAVAX – viêm gan A', diseaseName: 'Viêm gan A', doses: 2, protocol: '2 Liều' },
      { vaccineName: 'TWINRIX – viêm gan A+B', diseaseName: 'Viêm gan A+B', doses: 3, protocol: '3 Liều' },
      { vaccineName: 'GARDASIL 9', diseaseName: 'HPV', doses: 3, protocol: '3 Liều' },
      { vaccineName: 'IVACFLU-S', diseaseName: 'Cúm', doses: 1, protocol: '1 Liều/năm' },
      { vaccineName: 'Uốn ván hấp phụ (TT)', diseaseName: 'Uốn ván', doses: 3, protocol: '3 Liều' },
    ],
  },
  {
    name: 'Gói Vắc Xin Phụ Nữ Có Thai',
    targetGroup: 'Phụ nữ mang thai',
    packageType: 'by_target',
    order: 4,
    items: [
      { vaccineName: 'GCFLU QUADRIVALENT', diseaseName: 'Cúm', doses: 1, protocol: '1 Liều/năm' },
      { vaccineName: 'Uốn ván hấp phụ (TT)', diseaseName: 'Uốn ván / Bạch hầu', doses: 2, protocol: '2 Liều' },
      { vaccineName: 'ADACEL', diseaseName: 'Bạch hầu – Ho gà – Uốn ván (Tdap)', doses: 1, protocol: '1 Liều' },
      { vaccineName: 'BOOSTRIX', diseaseName: 'Bạch hầu – Ho gà – Uốn ván (Tdap)', doses: 1, protocol: '1 Liều' },
    ],
  },
  {
    name: 'Gói Vắc Xin Người Cao Tuổi, Có Bệnh Nền',
    targetGroup: 'Người cao tuổi và người có bệnh nền',
    packageType: 'by_target',
    order: 5,
    items: [
      { vaccineName: 'GCFLU QUADRIVALENT', diseaseName: 'Cúm', doses: 1, protocol: '1 Liều/năm' },
      { vaccineName: 'HAVAX – viêm gan A', diseaseName: 'Viêm gan A', doses: 2, protocol: '2 Liều' },
      { vaccineName: 'TWINRIX – viêm gan A+B', diseaseName: 'Viêm gan A+B', doses: 3, protocol: '3 Liều' },
      { vaccineName: 'PNEUMOVAX 23', diseaseName: 'Phế cầu', doses: 1, protocol: '1 Liều' },
      { vaccineName: 'SHINGRIX', diseaseName: 'Zona thần kinh', doses: 2, protocol: '2 Liều' },
      { vaccineName: 'ADACEL', diseaseName: 'Bạch hầu – Ho gà – Uốn ván', doses: 1, protocol: '1 Liều' },
      { vaccineName: 'QDENGA', diseaseName: 'Sốt xuất huyết', doses: 2, protocol: '2 Liều' },
    ],
  },
];

// ─── Helper: Login ────────────────────────────────────────────────────────────
async function login() {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  if (!data.token) throw new Error('Login failed: ' + JSON.stringify(data));
  console.log('✅ Đăng nhập thành công');
  return data.token;
}

// ─── Helper: POST ─────────────────────────────────────────────────────────────
async function post(token, collection, body) {
  const res = await fetch(`${BASE_URL}/api/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.errors || !data.doc) {
    console.error(`❌ Error creating ${collection} (status ${res.status}):`, JSON.stringify(data).slice(0, 500));
    return null;
  }
  return data.doc;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const token = await login();

  // 1. Tạo tất cả vắc xin
  console.log(`\n📌 Tạo ${VACCINES.length} vắc xin...`);
  const vaccineMap = {}; // name → id
  for (const v of VACCINES) {
    const doc = await post(token, 'vaccines', { ...v, status: 'in_stock' });
    if (doc) {
      vaccineMap[v.name] = doc.id;
      process.stdout.write('.');
    }
  }
  console.log(`\n✅ Đã tạo ${Object.keys(vaccineMap).length} vắc xin\n`);

  // 2. Tạo các gói vắc xin
  console.log(`📦 Tạo ${PACKAGES_DEF.length} gói vắc xin...`);
  for (const pkg of PACKAGES_DEF) {
    const items = pkg.items.map(item => {
      const vaccineId = vaccineMap[item.vaccineName];
      if (!vaccineId) console.warn(`  ⚠️  Không tìm thấy vaccine: ${item.vaccineName}`);
      return {
        vaccine: vaccineId || null,
        diseaseName: item.diseaseName,
        doses: item.doses,
        protocol: item.protocol,
      };
    }).filter(i => i.vaccine);

    // Tính giá tổng cộng ước tính từ giá từng vắc xin
    let totalPrice = 0;
    for (const item of pkg.items) {
      const vac = VACCINES.find(v => v.name === item.vaccineName);
      if (vac) totalPrice += vac.price * item.doses;
    }

    const doc = await post(token, 'vaccine-packages', {
      name: pkg.name,
      targetGroup: pkg.targetGroup,
      packageType: pkg.packageType,
      order: pkg.order,
      isFeatured: pkg.isFeatured || false,
      isActive: true,
      discountPrice: Math.round(totalPrice * 0.9), // -10% ước tính
      originalPrice: totalPrice,
      discountLabel: `Giá tham khảo tại CDC Đà Nẵng`,
      items,
    });
    if (doc) console.log(`  ✅ ${pkg.name}`);
  }

  console.log('\n🎉 Hoàn tất! Vào /goi-vac-xin để xem kết quả.');
}

main().catch(err => { console.error('💥', err.message); process.exit(1); });
