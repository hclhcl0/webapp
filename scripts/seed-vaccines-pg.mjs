/**
 * Seed vaccine packages trực tiếp vào PostgreSQL (không cần Payload server)
 * Chạy: node scripts/seed-vaccines-pg.mjs
 */
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgres://postgres:123456@127.0.0.1:5432/webcq' });

// ─── Kiểm tra vaccines table có tồn tại không ─────────────────────────────
const VACCINE_ROWS = [
  { name: 'INFANRIX HEXA', disease: '6 trong 1 (Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, Viêm gan B)', origin: 'Bỉ', price: 1042204, targetGroup: 'Trẻ từ 2 tháng tuổi', status: 'in_stock' },
  { name: 'HEXAXIM', disease: '6 trong 1 (Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, Viêm gan B)', origin: 'Pháp', price: 1013150, targetGroup: 'Trẻ từ 6 tuần tuổi', status: 'in_stock' },
  { name: 'ROTATEQ', disease: 'Tiêu chảy do Rotavirus', origin: 'Mỹ', price: 628820, targetGroup: 'Trẻ từ 6-32 tuần tuổi', status: 'in_stock' },
  { name: 'ROTARIX', disease: 'Tiêu chảy do Rotavirus', origin: 'Bỉ', price: 860335, targetGroup: 'Trẻ từ 6 tuần tuổi', status: 'in_stock' },
  { name: 'ROTAVIN', disease: 'Tiêu chảy do Rotavirus', origin: 'Việt Nam', price: 433280, targetGroup: 'Trẻ từ 6 tuần tuổi', status: 'in_stock' },
  { name: 'SYNFLORIX 10', disease: 'Phế cầu (10 chủng)', origin: 'Bỉ', price: 926400, targetGroup: 'Trẻ từ 6 tuần đến 5 tuổi', status: 'in_stock' },
  { name: 'PREVENAR 13', disease: 'Phế cầu (13 chủng)', origin: 'Bỉ', price: 1173800, targetGroup: 'Trẻ từ 2 tháng tuổi', status: 'in_stock' },
  { name: 'VAXNEUVANCE 15', disease: 'Phế cầu (15 chủng)', origin: 'Ai-len', price: 1496500, targetGroup: 'Trẻ từ 6 tuần và người lớn', status: 'in_stock' },
  { name: 'IVACFLU-S', disease: 'Cúm mùa', origin: 'Việt Nam', price: 245600, targetGroup: 'Từ 6 tháng tuổi', status: 'in_stock' },
  { name: 'GCFLU QUADRIVALENT', disease: 'Cúm mùa (4 chủng)', origin: 'Hàn Quốc', price: 355640, targetGroup: 'Từ 6 tháng tuổi', status: 'in_stock' },
  { name: 'INFLUVAC TETRA', disease: 'Cúm mùa (4 chủng)', origin: 'Hà Lan', price: 364500, targetGroup: 'Từ 6 tháng tuổi', status: 'in_stock' },
  { name: 'VAXIGRIP TETRA', disease: 'Cúm mùa (4 chủng)', origin: 'Pháp', price: 370500, targetGroup: 'Từ 6 tháng tuổi', status: 'in_stock' },
  { name: 'MENACTRA – ACYW', disease: 'Não mô cầu nhóm A, C, Y, W', origin: 'Mỹ', price: 1198500, targetGroup: 'Từ 9 tháng đến 55 tuổi', status: 'in_stock' },
  { name: 'BEXSERO – nhóm B', disease: 'Não mô cầu nhóm B', origin: 'Ý', price: 1626426, targetGroup: 'Từ 2 tháng tuổi', status: 'in_stock' },
  { name: 'VA-MENGOC-BC – nhóm BC', disease: 'Não mô cầu nhóm B, C', origin: 'Cuba', price: 271892, targetGroup: 'Từ 6 tháng đến 45 tuổi', status: 'in_stock' },
  { name: 'PRIORIX', disease: 'Sởi – Quai bị – Rubella', origin: 'Bỉ', price: 370500, targetGroup: 'Từ 12 tháng tuổi', status: 'in_stock' },
  { name: 'M-M-R II', disease: 'Sởi – Quai bị – Rubella', origin: 'Mỹ', price: 317756, targetGroup: 'Từ 12 tháng tuổi', status: 'in_stock' },
  { name: 'Vắc xin Sởi-Quai bị-Rubella', disease: 'Sởi – Quai bị – Rubella', origin: 'Ấn Độ', price: 275682, targetGroup: 'Từ 12 tháng tuổi', status: 'in_stock' },
  { name: 'IMOJEV', disease: 'Viêm não Nhật Bản', origin: 'Thái Lan', price: 795718, targetGroup: 'Từ 9 tháng tuổi', status: 'in_stock' },
  { name: 'JEVAX', disease: 'Viêm não Nhật Bản', origin: 'Việt Nam', price: 160140, targetGroup: 'Từ 1 đến 15 tuổi', status: 'in_stock' },
  { name: 'JEEV 3mcg', disease: 'Viêm não Nhật Bản', origin: 'Ấn Độ', price: 369500, targetGroup: 'Từ 1 tuổi', status: 'in_stock' },
  { name: 'JEEV 6mcg', disease: 'Viêm não Nhật Bản', origin: 'Ấn Độ', price: 479750, targetGroup: 'Từ 12 tuổi', status: 'in_stock' },
  { name: 'VARILRIX', disease: 'Thủy đậu', origin: 'Bỉ', price: 936664, targetGroup: 'Từ 9 tháng tuổi', status: 'in_stock' },
  { name: 'VARIVAX', disease: 'Thủy đậu', origin: 'Mỹ', price: 972695, targetGroup: 'Từ 12 tháng tuổi', status: 'in_stock' },
  { name: 'QDENGA', disease: 'Sốt xuất huyết Dengue', origin: 'Đức', price: 1060836, targetGroup: 'Từ 4 đến 60 tuổi', status: 'in_stock' },
  { name: 'TYPHIMVI', disease: 'Thương hàn', origin: 'Pháp', price: 270879, targetGroup: 'Từ 2 tuổi', status: 'in_stock' },
  { name: 'MORCVAX', disease: 'Tả', origin: 'Việt Nam', price: 168885, targetGroup: 'Từ 2 tuổi', status: 'in_stock' },
  { name: 'HAVAX', disease: 'Viêm gan A', origin: 'Việt Nam', price: 209270, targetGroup: 'Từ 12 tháng tuổi', status: 'in_stock' },
  { name: 'AVAXIM 80 U', disease: 'Viêm gan A', origin: 'Pháp', price: 554644, targetGroup: 'Từ 12 tháng tuổi', status: 'in_stock' },
  { name: 'TWINRIX', disease: 'Viêm gan A và B', origin: 'Bỉ', price: 607422, targetGroup: 'Từ 1 tuổi', status: 'in_stock' },
  { name: 'Hebebiovac 1ml – viêm gan B', disease: 'Viêm gan B', origin: 'Cuba', price: 176405, targetGroup: 'Từ sơ sinh', status: 'in_stock' },
  { name: 'Gene Hbvax 1ml – viêm gan B', disease: 'Viêm gan B', origin: 'Việt Nam', price: 173108, targetGroup: 'Từ sơ sinh', status: 'in_stock' },
  { name: 'GARDASIL 9', disease: 'HPV (9 chủng)', origin: 'Mỹ', price: 2823350, targetGroup: 'Từ 9 đến 45 tuổi', status: 'in_stock' },
  { name: 'GARDASIL (4)', disease: 'HPV (4 chủng)', origin: 'Mỹ', price: 1606100, targetGroup: 'Từ 9 đến 45 tuổi', status: 'in_stock' },
  { name: 'Uốn ván hấp phụ (TT)', disease: 'Uốn ván', origin: 'Việt Nam', price: 112762, targetGroup: 'Người lớn', status: 'in_stock' },
  { name: 'Uốn ván bạch hầu (Td)', disease: 'Uốn ván – Bạch hầu', origin: 'Việt Nam', price: 127945, targetGroup: 'Từ 7 tuổi', status: 'in_stock' },
  { name: 'ADACEL', disease: 'Bạch hầu – Ho gà – Uốn ván (Tdap)', origin: 'Canada', price: 656295, targetGroup: 'Từ 10 đến 64 tuổi', status: 'in_stock' },
  { name: 'BOOSTRIX', disease: 'Bạch hầu – Ho gà – Uốn ván (Tdap)', origin: 'Bỉ', price: 694500, targetGroup: 'Từ 4 tuổi', status: 'in_stock' },
  { name: 'PNEUMOVAX 23', disease: 'Phế cầu (23 chủng)', origin: 'Mỹ', price: 917268, targetGroup: 'Người cao tuổi, từ 50 tuổi', status: 'in_stock' },
  { name: 'SHINGRIX', disease: 'Zona thần kinh (Herpes Zoster)', origin: 'Bỉ', price: 3491885, targetGroup: 'Từ 50 tuổi', status: 'in_stock' },
];

// items: { vaccineName, diseaseName, doses, protocol }
const PACKAGES_DEF = [
  {
    name: 'Gói Vắc Xin Trẻ Em Dưới 1 Tuổi',
    targetGroup: '0 – 12 tháng tuổi',
    packageType: 'by_age', order: 1, isFeatured: true, isActive: true,
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
    packageType: 'by_age', order: 2, isFeatured: false, isActive: true,
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
    packageType: 'by_target', order: 3, isFeatured: false, isActive: true,
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
    packageType: 'by_target', order: 4, isFeatured: false, isActive: true,
    items: [
      { vn: 'GCFLU QUADRIVALENT', dn: 'Cúm', doses: 1, protocol: '1 Liều/năm' },
      { vn: 'Uốn ván hấp phụ (TT)', dn: 'Uốn ván / Bạch hầu', doses: 2, protocol: '2 Liều' },
      { vn: 'ADACEL', dn: 'Bạch hầu – Ho gà – Uốn ván (Tdap)', doses: 1, protocol: '1 Liều' },
      { vn: 'BOOSTRIX', dn: 'Bạch hầu – Ho gà – Uốn ván (Tdap)', doses: 1, protocol: '1 Liều (thay thế)' },
    ],
  },
  {
    name: 'Gói Vắc Xin Người Cao Tuổi & Có Bệnh Nền',
    targetGroup: 'Người cao tuổi và người có bệnh nền',
    packageType: 'by_target', order: 5, isFeatured: false, isActive: true,
    items: [
      { vn: 'GCFLU QUADRIVALENT', dn: 'Cúm', doses: 1, protocol: '1 Liều/năm' },
      { vn: 'TWINRIX', dn: 'Viêm gan A+B', doses: 3, protocol: '3 Liều' },
      { vn: 'PNEUMOVAX 23', dn: 'Phế cầu (23 chủng)', doses: 1, protocol: '1 Liều' },
      { vn: 'SHINGRIX', dn: 'Zona thần kinh', doses: 2, protocol: '2 Liều' },
      { vn: 'ADACEL', dn: 'Bạch hầu – Ho gà – Uốn ván', doses: 1, protocol: '1 Liều' },
      { vn: 'QDENGA', dn: 'Sốt xuất huyết', doses: 2, protocol: '2 Liều' },
    ],
  },
];

async function run() {
  const client = await pool.connect();
  try {
    // Xoá dữ liệu cũ
    console.log('🗑️  Xoá dữ liệu cũ...');
    await client.query('DELETE FROM vaccine_packages_items');
    await client.query('DELETE FROM vaccine_packages');
    // Chỉ xoá vaccines đã tạo bởi seed (nếu có)

    // Tạo vaccines
    console.log(`\n📌 Tạo ${VACCINE_ROWS.length} vắc xin...`);
    const vaccineIdMap = {};
    const now = new Date().toISOString();
    for (const v of VACCINE_ROWS) {
      // Kiểm tra đã tồn tại chưa (dùng upsert dựa trên tên)
      const existing = await client.query('SELECT id FROM vaccines WHERE name = $1 LIMIT 1', [v.name]);
      let id;
      if (existing.rows.length > 0) {
        id = existing.rows[0].id;
        // Cập nhật giá
        await client.query(
          'UPDATE vaccines SET price = $1, origin = $2, target_group = $3, status = $4, disease = $5 WHERE id = $6',
          [v.price, v.origin, v.targetGroup, v.status, v.disease, id]
        );
      } else {
        const r = await client.query(
          `INSERT INTO vaccines (name, disease, origin, price, target_group, status, updated_at, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
          [v.name, v.disease, v.origin, v.price, v.targetGroup, v.status, now, now]
        );
        id = r.rows[0].id;
      }
      vaccineIdMap[v.name] = id;
      process.stdout.write('.');
    }
    console.log(`\n✅ Đã xử lý ${Object.keys(vaccineIdMap).length} vắc xin\n`);

    // Tạo packages
    console.log(`📦 Tạo ${PACKAGES_DEF.length} gói vắc xin...`);
    for (const pkg of PACKAGES_DEF) {
      // Tính giá
      let total = 0;
      for (const item of pkg.items) {
        const vac = VACCINE_ROWS.find(v => v.name === item.vn);
        if (vac) total += vac.price * item.doses;
      }
      const discountPrice = Math.round(total * 0.9);
      const discountLabel = 'Giá tham khảo tại CDC Đà Nẵng';

      const pkgRes = await client.query(
        `INSERT INTO vaccine_packages
           (name, target_group, package_type, "order", is_featured, is_active,
            original_price, discount_price, discount_label, updated_at, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
        [pkg.name, pkg.targetGroup, pkg.packageType, pkg.order,
         pkg.isFeatured, pkg.isActive, total, discountPrice, discountLabel, now, now]
      );
      const pkgId = pkgRes.rows[0].id;

      // Tạo items
      for (let i = 0; i < pkg.items.length; i++) {
        const item = pkg.items[i];
        const vaccineId = vaccineIdMap[item.vn];
        const unitPrice = VACCINE_ROWS.find(v => v.name === item.vn)?.price || null;
        if (!vaccineId) { console.warn(`  ⚠️  Không tìm thấy vaccine: ${item.vn}`); continue; }
        await client.query(
          `INSERT INTO vaccine_packages_items
             (_order, _parent_id, vaccine_id, disease_name, doses, protocol, unit_price)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [i + 1, pkgId, vaccineId, item.dn, item.doses, item.protocol, unitPrice]
        );
      }
      console.log(`  ✅ ${pkg.name} (id=${pkgId})`);
    }

    console.log('\n🎉 Seed hoàn tất! Vào http://localhost:3000/goi-vac-xin để xem.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => { console.error('💥', e.message); process.exit(1); });
