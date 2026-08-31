// @ts-nocheck
import type { Payload } from 'payload';

export interface DeptAccountDef {
  code: string;
  altCode?: string;
  email: string;
  name: string;
  deptName: string;
  deptCode: string;
  deptType: 'phong' | 'khoa' | 'bo-phan' | 'ban' | 'trung-tam' | 'khac';
  order: number;
  role: 'admin' | 'moderator' | 'editor' | 'author' | 'user';
}

export const DEPARTMENT_ACCOUNTS: DeptAccountDef[] = [
  {
    code: 'ptchcd',
    altCode: 'kptchc',
    email: 'ptchcd@cdcdanang.vn',
    name: 'Phòng Tổ chức - Hành chính',
    deptName: 'Phòng Tổ chức - Hành chính',
    deptCode: 'P-TCHC',
    deptType: 'phong',
    order: 2,
    role: 'author',
  },
  {
    code: 'pkhnvd',
    altCode: 'kpkhnv',
    email: 'pkhnvd@cdcdanang.vn',
    name: 'Phòng Kế hoạch - Nghiệp vụ',
    deptName: 'Phòng Kế hoạch - Nghiệp vụ',
    deptCode: 'P-KHNV',
    deptType: 'phong',
    order: 3,
    role: 'author',
  },
  {
    code: 'ptcktd',
    altCode: 'kptckt',
    email: 'ptcktd@cdcdanang.vn',
    name: 'Phòng Tài chính - Kế toán',
    deptName: 'Phòng Tài chính - Kế toán',
    deptCode: 'P-TCKT',
    deptType: 'phong',
    order: 4,
    role: 'author',
  },
  {
    code: 'kpcbtn',
    altCode: 'kpcbtn',
    email: 'kpcbtn@cdcdanang.vn',
    name: 'Khoa Phòng chống bệnh truyền nhiễm',
    deptName: 'Khoa Phòng chống bệnh truyền nhiễm',
    deptCode: 'K-PCBTN',
    deptType: 'khoa',
    order: 5,
    role: 'author',
  },
  {
    code: 'kpchiv',
    altCode: 'kphiva',
    email: 'kpchiv@cdcdanang.vn',
    name: 'Khoa phòng chống HIV/AIDS',
    deptName: 'Khoa phòng chống HIV/AIDS',
    deptCode: 'K-HIV',
    deptType: 'khoa',
    order: 6,
    role: 'author',
  },
  {
    code: 'kpbkln',
    altCode: 'kpcbln',
    email: 'kpbkln@cdcdanang.vn',
    name: 'Khoa phòng, chống bệnh không lây nhiễm',
    deptName: 'Khoa phòng, chống bệnh không lây nhiễm',
    deptCode: 'K-BKLN',
    deptType: 'khoa',
    order: 7,
    role: 'author',
  },
  {
    code: 'kdinhd',
    altCode: 'kpdduo',
    email: 'kdinhd@cdcdanang.vn',
    name: 'Khoa Dinh dưỡng',
    deptName: 'Khoa Dinh dưỡng',
    deptCode: 'K-DD',
    deptType: 'khoa',
    order: 8,
    role: 'author',
  },
  {
    code: 'kskmty',
    altCode: 'kpskmt',
    email: 'kskmty@cdcdanang.vn',
    name: 'Khoa Sức khỏe môi trường - Y tế trường học',
    deptName: 'Khoa Sức khỏe môi trường - Y tế trường học',
    deptCode: 'K-SKMT',
    deptType: 'khoa',
    order: 9,
    role: 'author',
  },
  {
    code: 'kbnghn',
    altCode: 'kpbngn',
    email: 'kbnghn@cdcdanang.vn',
    name: 'Khoa Bệnh nghề nghiệp',
    deptName: 'Khoa Bệnh nghề nghiệp',
    deptCode: 'K-BNN',
    deptType: 'khoa',
    order: 10,
    role: 'author',
  },
  {
    code: 'kcssks',
    altCode: 'kpskss',
    email: 'kcssks@cdcdanang.vn',
    name: 'Khoa chăm sóc sức khỏe sinh sản',
    deptName: 'Khoa chăm sóc sức khỏe sinh sản',
    deptCode: 'K-SKSS',
    deptType: 'khoa',
    order: 11,
    role: 'author',
  },
  {
    code: 'kttgds',
    altCode: 'kpttgd',
    email: 'kttgds@cdcdanang.vn',
    name: 'Khoa Truyền thông, giáo dục sức khỏe',
    deptName: 'Khoa Truyền thông, giáo dục sức khỏe',
    deptCode: 'K-TTGDSK',
    deptType: 'khoa',
    order: 12,
    role: 'author',
  },
  {
    code: 'kkstct',
    altCode: 'kpkstc',
    email: 'kkstct@cdcdanang.vn',
    name: 'Khoa Ký sinh trùng - Côn trùng',
    deptName: 'Khoa Ký sinh trùng - Côn trùng',
    deptCode: 'K-KST',
    deptType: 'khoa',
    order: 13,
    role: 'author',
  },
  {
    code: 'kkdytq',
    altCode: 'kpkdyt',
    email: 'kkdytq@cdcdanang.vn',
    name: 'Khoa Kiểm dịch Y tế quốc tế',
    deptName: 'Khoa Kiểm dịch Y tế quốc tế',
    deptCode: 'K-KDYT',
    deptType: 'khoa',
    order: 14,
    role: 'author',
  },
  {
    code: 'kdvtyt',
    altCode: 'kpdvty',
    email: 'kdvtyt@cdcdanang.vn',
    name: 'Khoa Dược - Vật tư Y tế',
    deptName: 'Khoa Dược - Vật tư Y tế',
    deptCode: 'K-DVTYT',
    deptType: 'khoa',
    order: 15,
    role: 'author',
  },
  {
    code: 'kxncdh',
    altCode: 'kpxncd',
    email: 'kxncdh@cdcdanang.vn',
    name: 'Khoa Xét nghiệm - CĐHA - TDCN',
    deptName: 'Khoa Xét nghiệm - CĐHA - TDCN',
    deptCode: 'K-XN',
    deptType: 'khoa',
    order: 16,
    role: 'author',
  },
  {
    code: 'pkdkdn',
    altCode: 'kppkdk',
    email: 'pkdkdn@cdcdanang.vn',
    name: 'Phòng khám đa khoa',
    deptName: 'Phòng khám đa khoa',
    deptCode: 'P-PKDK',
    deptType: 'phong',
    order: 17,
    role: 'author',
  },
];

export const seedAccounts = async (payload: Payload) => {
  // 1. Khởi tạo / cập nhật 16 phòng ban trong collection 'departments'
  const departmentMap = new Map<string, string | number>();

  for (const item of DEPARTMENT_ACCOUNTS) {
    try {
      const existingDept = await payload.find({
        collection: 'departments',
        where: { code: { equals: item.deptCode } },
        limit: 1,
      });

      let deptId;
      if (existingDept.totalDocs > 0) {
        deptId = existingDept.docs[0].id;
      } else {
        const createdDept = await payload.create({
          collection: 'departments',
          data: {
            name: item.deptName,
            code: item.deptCode,
            type: item.deptType,
            sortOrder: item.order,
          },
        });
        deptId = createdDept.id;
        payload.logger.info(`[Seed] Created department: ${item.deptName} (${item.deptCode})`);
      }
      departmentMap.set(item.deptCode, deptId);
    } catch (e: any) {
      payload.logger.error(`[Seed] Error ensuring department ${item.deptName}: ${e.message}`);
    }
  }

  // 2. Khởi tạo 16 tài khoản khoa phòng với mật khẩu 118ldl
  for (const item of DEPARTMENT_ACCOUNTS) {
    const deptId = departmentMap.get(item.deptCode);
    const emailsToEnsure = [item.email];
    if (item.altCode && item.altCode !== item.code) {
      emailsToEnsure.push(`${item.altCode}@cdcdanang.vn`);
    }

    for (const email of emailsToEnsure) {
      try {
        const existing = await payload.find({
          collection: 'users',
          where: { email: { equals: email } },
          limit: 1,
        });

        if (existing.totalDocs === 0) {
          await payload.create({
            collection: 'users',
            data: {
              email: email,
              password: '118ldl',
              name: item.name,
              role: item.role || 'author',
              department: deptId || undefined,
            },
          });
          payload.logger.info(`[Seed] Created department user: ${email}`);
        } else {
          // Cập nhật mật khẩu và phòng ban nếu cần
          const userDoc = existing.docs[0];
          await payload.update({
            collection: 'users',
            id: userDoc.id,
            data: {
              password: '118ldl',
              department: deptId || userDoc.department,
            },
          });
          payload.logger.info(`[Seed] Updated department user password & dept: ${email}`);
        }
      } catch (error: any) {
        payload.logger.error(`[Seed] Error seeding ${email}: ${error.message}`);
      }
    }
  }
};
