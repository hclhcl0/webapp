-- ============================================================
-- SEED: vaccine_packages + vaccine_packages_items (production)
-- Chạy trong: psql, DBeaver, Coolify DB terminal, hoặc bất kỳ SQL client
-- ============================================================

-- Bước 1: Tạo bảng nếu chưa có (an toàn với IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS "vaccine_packages" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar NOT NULL,
  "target_group" varchar NOT NULL,
  "package_type" varchar DEFAULT 'by_age' NOT NULL,
  "image_id" integer,
  "description" varchar,
  "original_price" numeric,
  "discount_price" numeric NOT NULL,
  "discount_label" varchar,
  "order" numeric DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "is_featured" boolean DEFAULT false,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "vaccine_packages_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "vaccine_id" integer,
  "disease_name" varchar,
  "doses" numeric NOT NULL,
  "protocol" varchar,
  "unit_price" numeric,
  "original_unit_price" numeric
);

-- Bước 2: Xoá data cũ (nếu có)
DELETE FROM vaccine_packages_items;
DELETE FROM vaccine_packages;

-- Bước 3: Đảm bảo vaccines tồn tại (upsert theo tên)
DO $$
DECLARE
  now_ts TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Helper: insert vaccine nếu chưa có
  INSERT INTO vaccines (name, disease, origin, price, target_group, status, updated_at, created_at)
  VALUES
    ('INFANRIX HEXA','6 trong 1 (Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, Viêm gan B)','Bỉ',1042204,'Trẻ từ 2 tháng tuổi','in_stock',now_ts,now_ts),
    ('HEXAXIM','6 trong 1 (Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, Viêm gan B)','Pháp',1013150,'Trẻ từ 6 tuần tuổi','in_stock',now_ts,now_ts),
    ('ROTATEQ','Tiêu chảy do Rotavirus','Mỹ',628820,'Trẻ từ 6-32 tuần tuổi','in_stock',now_ts,now_ts),
    ('ROTARIX','Tiêu chảy do Rotavirus','Bỉ',860335,'Trẻ từ 6 tuần tuổi','in_stock',now_ts,now_ts),
    ('ROTAVIN','Tiêu chảy do Rotavirus','Việt Nam',433280,'Trẻ từ 6 tuần tuổi','in_stock',now_ts,now_ts),
    ('SYNFLORIX 10','Phế cầu (10 chủng)','Bỉ',926400,'Trẻ từ 6 tuần đến 5 tuổi','in_stock',now_ts,now_ts),
    ('PREVENAR 13','Phế cầu (13 chủng)','Bỉ',1173800,'Trẻ từ 2 tháng tuổi','in_stock',now_ts,now_ts),
    ('VAXNEUVANCE 15','Phế cầu (15 chủng)','Ai-len',1496500,'Trẻ từ 6 tuần và người lớn','in_stock',now_ts,now_ts),
    ('IVACFLU-S','Cúm mùa','Việt Nam',245600,'Từ 6 tháng tuổi','in_stock',now_ts,now_ts),
    ('GCFLU QUADRIVALENT','Cúm mùa (4 chủng)','Hàn Quốc',355640,'Từ 6 tháng tuổi','in_stock',now_ts,now_ts),
    ('INFLUVAC TETRA','Cúm mùa (4 chủng)','Hà Lan',364500,'Từ 6 tháng tuổi','in_stock',now_ts,now_ts),
    ('VAXIGRIP TETRA','Cúm mùa (4 chủng)','Pháp',370500,'Từ 6 tháng tuổi','in_stock',now_ts,now_ts),
    ('MENACTRA – ACYW','Não mô cầu nhóm A, C, Y, W','Mỹ',1198500,'Từ 9 tháng đến 55 tuổi','in_stock',now_ts,now_ts),
    ('BEXSERO – nhóm B','Não mô cầu nhóm B','Ý',1626426,'Từ 2 tháng tuổi','in_stock',now_ts,now_ts),
    ('VA-MENGOC-BC – nhóm BC','Não mô cầu nhóm B, C','Cuba',271892,'Từ 6 tháng đến 45 tuổi','in_stock',now_ts,now_ts),
    ('PRIORIX','Sởi – Quai bị – Rubella','Bỉ',370500,'Từ 12 tháng tuổi','in_stock',now_ts,now_ts),
    ('M-M-R II','Sởi – Quai bị – Rubella','Mỹ',317756,'Từ 12 tháng tuổi','in_stock',now_ts,now_ts),
    ('Vắc xin Sởi-Quai bị-Rubella','Sởi – Quai bị – Rubella','Ấn Độ',275682,'Từ 12 tháng tuổi','in_stock',now_ts,now_ts),
    ('IMOJEV','Viêm não Nhật Bản','Thái Lan',795718,'Từ 9 tháng tuổi','in_stock',now_ts,now_ts),
    ('JEVAX','Viêm não Nhật Bản','Việt Nam',160140,'Từ 1 đến 15 tuổi','in_stock',now_ts,now_ts),
    ('JEEV 3mcg','Viêm não Nhật Bản','Ấn Độ',369500,'Từ 1 tuổi','in_stock',now_ts,now_ts),
    ('JEEV 6mcg','Viêm não Nhật Bản','Ấn Độ',479750,'Từ 12 tuổi','in_stock',now_ts,now_ts),
    ('VARILRIX','Thủy đậu','Bỉ',936664,'Từ 9 tháng tuổi','in_stock',now_ts,now_ts),
    ('VARIVAX','Thủy đậu','Mỹ',972695,'Từ 12 tháng tuổi','in_stock',now_ts,now_ts),
    ('QDENGA','Sốt xuất huyết Dengue','Đức',1060836,'Từ 4 đến 60 tuổi','in_stock',now_ts,now_ts),
    ('TYPHIMVI','Thương hàn','Pháp',270879,'Từ 2 tuổi','in_stock',now_ts,now_ts),
    ('MORCVAX','Tả','Việt Nam',168885,'Từ 2 tuổi','in_stock',now_ts,now_ts),
    ('HAVAX','Viêm gan A','Việt Nam',209270,'Từ 12 tháng tuổi','in_stock',now_ts,now_ts),
    ('AVAXIM 80 U','Viêm gan A','Pháp',554644,'Từ 12 tháng tuổi','in_stock',now_ts,now_ts),
    ('TWINRIX','Viêm gan A và B','Bỉ',607422,'Từ 1 tuổi','in_stock',now_ts,now_ts),
    ('Hebebiovac 1ml – viêm gan B','Viêm gan B','Cuba',176405,'Từ sơ sinh','in_stock',now_ts,now_ts),
    ('Gene Hbvax 1ml – viêm gan B','Viêm gan B','Việt Nam',173108,'Từ sơ sinh','in_stock',now_ts,now_ts),
    ('GARDASIL 9','HPV (9 chủng)','Mỹ',2823350,'Từ 9 đến 45 tuổi','in_stock',now_ts,now_ts),
    ('GARDASIL (4)','HPV (4 chủng)','Mỹ',1606100,'Từ 9 đến 45 tuổi','in_stock',now_ts,now_ts),
    ('Uốn ván hấp phụ (TT)','Uốn ván','Việt Nam',112762,'Người lớn','in_stock',now_ts,now_ts),
    ('Uốn ván bạch hầu (Td)','Uốn ván – Bạch hầu','Việt Nam',127945,'Từ 7 tuổi','in_stock',now_ts,now_ts),
    ('ADACEL','Bạch hầu – Ho gà – Uốn ván (Tdap)','Canada',656295,'Từ 10 đến 64 tuổi','in_stock',now_ts,now_ts),
    ('BOOSTRIX','Bạch hầu – Ho gà – Uốn ván (Tdap)','Bỉ',694500,'Từ 4 tuổi','in_stock',now_ts,now_ts),
    ('PNEUMOVAX 23','Phế cầu (23 chủng)','Mỹ',917268,'Người cao tuổi, từ 50 tuổi','in_stock',now_ts,now_ts),
    ('SHINGRIX','Zona thần kinh (Herpes Zoster)','Bỉ',3491885,'Từ 50 tuổi','in_stock',now_ts,now_ts);
END $$;

-- Bước 4: Tạo các gói vắc xin
DO $$
DECLARE
  pkg1_id INT; pkg2_id INT; pkg3_id INT; pkg4_id INT; pkg5_id INT;
  now_ts TIMESTAMP WITH TIME ZONE := NOW();
  -- Vaccine IDs
  v_hexaxim INT; v_rotarix INT; v_synflorix INT; v_ivacflu INT; v_bexsero INT; v_menactra INT;
  v_priorix INT; v_imojev INT; v_varilrix INT;
  v_mmr2 INT; v_jevax INT; v_varivax INT; v_qdenga INT; v_typhimvi INT; v_morcvax INT; v_havax INT;
  v_twinrix INT; v_gardasil9 INT; v_uvhaphau INT;
  v_gcflu INT; v_uvhaphau2 INT; v_adacel INT; v_boostrix INT;
  v_pneumovax INT; v_shingrix INT;
BEGIN
  -- Lấy vaccine IDs
  SELECT id INTO v_hexaxim FROM vaccines WHERE name='HEXAXIM' LIMIT 1;
  SELECT id INTO v_rotarix FROM vaccines WHERE name='ROTARIX' LIMIT 1;
  SELECT id INTO v_synflorix FROM vaccines WHERE name='SYNFLORIX 10' LIMIT 1;
  SELECT id INTO v_ivacflu FROM vaccines WHERE name='IVACFLU-S' LIMIT 1;
  SELECT id INTO v_bexsero FROM vaccines WHERE name='BEXSERO – nhóm B' LIMIT 1;
  SELECT id INTO v_menactra FROM vaccines WHERE name='MENACTRA – ACYW' LIMIT 1;
  SELECT id INTO v_priorix FROM vaccines WHERE name='PRIORIX' LIMIT 1;
  SELECT id INTO v_imojev FROM vaccines WHERE name='IMOJEV' LIMIT 1;
  SELECT id INTO v_varilrix FROM vaccines WHERE name='VARILRIX' LIMIT 1;
  SELECT id INTO v_mmr2 FROM vaccines WHERE name='M-M-R II' LIMIT 1;
  SELECT id INTO v_jevax FROM vaccines WHERE name='JEVAX' LIMIT 1;
  SELECT id INTO v_varivax FROM vaccines WHERE name='VARIVAX' LIMIT 1;
  SELECT id INTO v_qdenga FROM vaccines WHERE name='QDENGA' LIMIT 1;
  SELECT id INTO v_typhimvi FROM vaccines WHERE name='TYPHIMVI' LIMIT 1;
  SELECT id INTO v_morcvax FROM vaccines WHERE name='MORCVAX' LIMIT 1;
  SELECT id INTO v_havax FROM vaccines WHERE name='HAVAX' LIMIT 1;
  SELECT id INTO v_twinrix FROM vaccines WHERE name='TWINRIX' LIMIT 1;
  SELECT id INTO v_gardasil9 FROM vaccines WHERE name='GARDASIL 9' LIMIT 1;
  SELECT id INTO v_uvhaphau FROM vaccines WHERE name='Uốn ván hấp phụ (TT)' LIMIT 1;
  SELECT id INTO v_gcflu FROM vaccines WHERE name='GCFLU QUADRIVALENT' LIMIT 1;
  SELECT id INTO v_adacel FROM vaccines WHERE name='ADACEL' LIMIT 1;
  SELECT id INTO v_boostrix FROM vaccines WHERE name='BOOSTRIX' LIMIT 1;
  SELECT id INTO v_pneumovax FROM vaccines WHERE name='PNEUMOVAX 23' LIMIT 1;
  SELECT id INTO v_shingrix FROM vaccines WHERE name='SHINGRIX' LIMIT 1;

  -- ── Gói 1: Trẻ Em Dưới 1 Tuổi ────────────────────────────────────────────
  INSERT INTO vaccine_packages (name,target_group,package_type,"order",is_featured,is_active,original_price,discount_price,discount_label,updated_at,created_at)
  VALUES ('Gói Vắc Xin Trẻ Em Dưới 1 Tuổi','0 – 12 tháng tuổi','by_age',1,true,true,
    (1013150*3)+(860335*2)+(926400*3)+(245600*2)+(1626426*2)+(1198500*1)+(370500*1)+(795718*1)+(936664*1),
    ROUND(((1013150*3)+(860335*2)+(926400*3)+(245600*2)+(1626426*2)+(1198500*1)+(370500*1)+(795718*1)+(936664*1))*0.9),
    'Giá tham khảo tại CDC Đà Nẵng',now_ts,now_ts)
  RETURNING id INTO pkg1_id;
  INSERT INTO vaccine_packages_items (_order,_parent_id,vaccine_id,disease_name,doses,protocol,unit_price) VALUES
    (1,pkg1_id,v_hexaxim,'6 trong 1',3,'3 Liều',1013150),
    (2,pkg1_id,v_rotarix,'Rota (Tiêu chảy)',2,'2 Liều',860335),
    (3,pkg1_id,v_synflorix,'Phế cầu',3,'3 Liều',926400),
    (4,pkg1_id,v_ivacflu,'Cúm',2,'2 Liều',245600),
    (5,pkg1_id,v_bexsero,'Não mô cầu nhóm B',2,'2 Liều',1626426),
    (6,pkg1_id,v_menactra,'Não mô cầu ACYW',1,'1 Liều',1198500),
    (7,pkg1_id,v_priorix,'Sởi – Quai bị – Rubella',1,'1 Liều',370500),
    (8,pkg1_id,v_imojev,'Viêm não Nhật Bản',1,'1 Liều',795718),
    (9,pkg1_id,v_varilrix,'Thủy đậu',1,'1 Liều',936664);

  -- ── Gói 2: Trẻ Em Trên 1 Tuổi ────────────────────────────────────────────
  INSERT INTO vaccine_packages (name,target_group,package_type,"order",is_featured,is_active,original_price,discount_price,discount_label,updated_at,created_at)
  VALUES ('Gói Vắc Xin Trẻ Em Trên 1 Tuổi','Từ 1 tuổi trở lên','by_age',2,false,true,
    (317756*2)+(160140*3)+(972695*1)+(1060836*2)+(270879*1)+(168885*2)+(209270*2),
    ROUND(((317756*2)+(160140*3)+(972695*1)+(1060836*2)+(270879*1)+(168885*2)+(209270*2))*0.9),
    'Giá tham khảo tại CDC Đà Nẵng',now_ts,now_ts)
  RETURNING id INTO pkg2_id;
  INSERT INTO vaccine_packages_items (_order,_parent_id,vaccine_id,disease_name,doses,protocol,unit_price) VALUES
    (1,pkg2_id,v_mmr2,'Sởi – Quai bị – Rubella',2,'2 Liều',317756),
    (2,pkg2_id,v_jevax,'Viêm não Nhật Bản',3,'3 Liều',160140),
    (3,pkg2_id,v_varivax,'Thủy đậu',1,'1 Liều',972695),
    (4,pkg2_id,v_qdenga,'Sốt xuất huyết',2,'2 Liều',1060836),
    (5,pkg2_id,v_typhimvi,'Thương hàn',1,'1 Liều',270879),
    (6,pkg2_id,v_morcvax,'Tả',2,'2 Liều',168885),
    (7,pkg2_id,v_havax,'Viêm gan A',2,'2 Liều',209270);

  -- ── Gói 3: Người Chuẩn Bị Kết Hôn ───────────────────────────────────────
  INSERT INTO vaccine_packages (name,target_group,package_type,"order",is_featured,is_active,original_price,discount_price,discount_label,updated_at,created_at)
  VALUES ('Gói Vắc Xin Người Chuẩn Bị Kết Hôn','Người chuẩn bị kết hôn','by_target',3,false,true,
    (317756*1)+(972695*2)+(1060836*2)+(607422*3)+(2823350*3)+(245600*1)+(112762*3),
    ROUND(((317756*1)+(972695*2)+(1060836*2)+(607422*3)+(2823350*3)+(245600*1)+(112762*3))*0.9),
    'Giá tham khảo tại CDC Đà Nẵng',now_ts,now_ts)
  RETURNING id INTO pkg3_id;
  INSERT INTO vaccine_packages_items (_order,_parent_id,vaccine_id,disease_name,doses,protocol,unit_price) VALUES
    (1,pkg3_id,v_mmr2,'Sởi – Quai bị – Rubella',1,'1 Liều',317756),
    (2,pkg3_id,v_varivax,'Thủy đậu',2,'2 Liều',972695),
    (3,pkg3_id,v_qdenga,'Sốt xuất huyết',2,'2 Liều',1060836),
    (4,pkg3_id,v_twinrix,'Viêm gan A+B',3,'3 Liều',607422),
    (5,pkg3_id,v_gardasil9,'HPV',3,'3 Liều',2823350),
    (6,pkg3_id,v_ivacflu,'Cúm',1,'1 Liều/năm',245600),
    (7,pkg3_id,v_uvhaphau,'Uốn ván',3,'3 Liều',112762);

  -- ── Gói 4: Phụ Nữ Có Thai ────────────────────────────────────────────────
  INSERT INTO vaccine_packages (name,target_group,package_type,"order",is_featured,is_active,original_price,discount_price,discount_label,updated_at,created_at)
  VALUES ('Gói Vắc Xin Phụ Nữ Có Thai','Phụ nữ mang thai','by_target',4,false,true,
    (355640*1)+(112762*2)+(656295*1)+(694500*1),
    ROUND(((355640*1)+(112762*2)+(656295*1)+(694500*1))*0.9),
    'Giá tham khảo tại CDC Đà Nẵng',now_ts,now_ts)
  RETURNING id INTO pkg4_id;
  INSERT INTO vaccine_packages_items (_order,_parent_id,vaccine_id,disease_name,doses,protocol,unit_price) VALUES
    (1,pkg4_id,v_gcflu,'Cúm',1,'1 Liều/năm',355640),
    (2,pkg4_id,v_uvhaphau,'Uốn ván / Bạch hầu',2,'2 Liều',112762),
    (3,pkg4_id,v_adacel,'Bạch hầu – Ho gà – Uốn ván (Tdap)',1,'1 Liều',656295),
    (4,pkg4_id,v_boostrix,'Bạch hầu – Ho gà – Uốn ván (Tdap)',1,'1 Liều (thay thế)',694500);

  -- ── Gói 5: Người Cao Tuổi & Có Bệnh Nền ─────────────────────────────────
  INSERT INTO vaccine_packages (name,target_group,package_type,"order",is_featured,is_active,original_price,discount_price,discount_label,updated_at,created_at)
  VALUES ('Gói Vắc Xin Người Cao Tuổi & Có Bệnh Nền','Người cao tuổi và người có bệnh nền','by_target',5,false,true,
    (355640*1)+(607422*3)+(917268*1)+(3491885*2)+(656295*1)+(1060836*2),
    ROUND(((355640*1)+(607422*3)+(917268*1)+(3491885*2)+(656295*1)+(1060836*2))*0.9),
    'Giá tham khảo tại CDC Đà Nẵng',now_ts,now_ts)
  RETURNING id INTO pkg5_id;
  INSERT INTO vaccine_packages_items (_order,_parent_id,vaccine_id,disease_name,doses,protocol,unit_price) VALUES
    (1,pkg5_id,v_gcflu,'Cúm',1,'1 Liều/năm',355640),
    (2,pkg5_id,v_twinrix,'Viêm gan A+B',3,'3 Liều',607422),
    (3,pkg5_id,v_pneumovax,'Phế cầu (23 chủng)',1,'1 Liều',917268),
    (4,pkg5_id,v_shingrix,'Zona thần kinh',2,'2 Liều',3491885),
    (5,pkg5_id,v_adacel,'Bạch hầu – Ho gà – Uốn ván',1,'1 Liều',656295),
    (6,pkg5_id,v_qdenga,'Sốt xuất huyết',2,'2 Liều',1060836);

  RAISE NOTICE 'Seed hoàn tất: pkg1=%, pkg2=%, pkg3=%, pkg4=%, pkg5=%', pkg1_id, pkg2_id, pkg3_id, pkg4_id, pkg5_id;
END $$;

-- Xác nhận kết quả
SELECT vp.id, vp.name, vp.is_active, COUNT(vpi.id) as item_count
FROM vaccine_packages vp
LEFT JOIN vaccine_packages_items vpi ON vpi._parent_id = vp.id
GROUP BY vp.id, vp.name, vp.is_active
ORDER BY vp."order";
