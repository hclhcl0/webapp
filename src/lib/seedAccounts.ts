// @ts-nocheck
import type { Payload } from 'payload';

export interface DeptAccountDef {
  code: string;
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
    code: 'tchcdn',
    email: 'tchcdn@cdcdanang.vn',
    name: 'Phòng Tổ chức - Hành chính',
    deptName: 'Phòng Tổ chức - Hành chính',
    deptCode: 'P-TCHC',
    deptType: 'phong',
    order: 2,
    role: 'author',
  },
  {
    code: 'khnvdn',
    email: 'khnvdn@cdcdanang.vn',
    name: 'Phòng Kế hoạch - Nghiệp vụ',
    deptName: 'Phòng Kế hoạch - Nghiệp vụ',
    deptCode: 'P-KHNV',
    deptType: 'phong',
    order: 3,
    role: 'author',
  },
  {
    code: 'tcktdn',
    email: 'tcktdn@cdcdanang.vn',
    name: 'Phòng Tài chính - Kế toán',
    deptName: 'Phòng Tài chính - Kế toán',
    deptCode: 'P-TCKT',
    deptType: 'phong',
    order: 4,
    role: 'author',
  },
  {
    code: 'pcbtnd',
    email: 'pcbtnd@cdcdanang.vn',
    name: 'Khoa Phòng chống bệnh truyền nhiễm',
    deptName: 'Khoa Phòng chống bệnh truyền nhiễm',
    deptCode: 'K-PCBTN',
    deptType: 'khoa',
    order: 5,
    role: 'author',
  },
  {
    code: 'pchivd',
    email: 'pchivd@cdcdanang.vn',
    name: 'Khoa phòng chống HIV/AIDS',
    deptName: 'Khoa phòng chống HIV/AIDS',
    deptCode: 'K-HIV',
    deptType: 'khoa',
    order: 6,
    role: 'author',
  },
  {
    code: 'pcbkln',
    email: 'pcbkln@cdcdanang.vn',
    name: 'Khoa phòng, chống bệnh không lây nhiễm',
    deptName: 'Khoa phòng, chống bệnh không lây nhiễm',
    deptCode: 'K-BKLN',
    deptType: 'khoa',
    order: 7,
    role: 'author',
  },
  {
    code: 'dduong',
    email: 'dduong@cdcdanang.vn',
    name: 'Khoa Dinh dưỡng',
    deptName: 'Khoa Dinh dưỡng',
    deptCode: 'K-DD',
    deptType: 'khoa',
    order: 8,
    role: 'author',
  },
  {
    code: 'skmtyt',
    email: 'skmtyt@cdcdanang.vn',
    name: 'Khoa Sức khỏe môi trường - Y tế trường học',
    deptName: 'Khoa Sức khỏe môi trường - Y tế trường học',
    deptCode: 'K-SKMT',
    deptType: 'khoa',
    order: 9,
    role: 'author',
  },
  {
    code: 'bnghen',
    email: 'bnghen@cdcdanang.vn',
    name: 'Khoa Bệnh nghề nghiệp',
    deptName: 'Khoa Bệnh nghề nghiệp',
    deptCode: 'K-BNN',
    deptType: 'khoa',
    order: 10,
    role: 'author',
  },
  {
    code: 'csskss',
    email: 'csskss@cdcdanang.vn',
    name: 'Khoa chăm sóc sức khỏe sinh sản',
    deptName: 'Khoa chăm sóc sức khỏe sinh sản',
    deptCode: 'K-SKSS',
    deptType: 'khoa',
    order: 11,
    role: 'author',
  },
  {
    code: 'ttgdsk',
    email: 'ttgdsk@cdcdanang.vn',
    name: 'Khoa Truyền thông, giáo dục sức khỏe',
    deptName: 'Khoa Truyền thông, giáo dục sức khỏe',
    deptCode: 'K-TTGDSK',
    deptType: 'khoa',
    order: 12,
    role: 'author',
  },
  {
    code: 'kstctd',
    email: 'kstctd@cdcdanang.vn',
    name: 'Khoa Ký sinh trùng - Côn trùng',
    deptName: 'Khoa Ký sinh trùng - Côn trùng',
    deptCode: 'K-KST',
    deptType: 'khoa',
    order: 13,
    role: 'author',
  },
  {
    code: 'kdytqt',
    email: 'kdytqt@cdcdanang.vn',
    name: 'Khoa Kiểm dịch Y tế quốc tế',
    deptName: 'Khoa Kiểm dịch Y tế quốc tế',
    deptCode: 'K-KDYT',
    deptType: 'khoa',
    order: 14,
    role: 'author',
  },
  {
    code: 'dvtytd',
    email: 'dvtytd@cdcdanang.vn',
    name: 'Khoa Dược - Vật tư Y tế',
    deptName: 'Khoa Dược - Vật tư Y tế',
    deptCode: 'K-DVTYT',
    deptType: 'khoa',
    order: 15,
    role: 'author',
  },
  {
    code: 'xncdha',
    email: 'xncdha@cdcdanang.vn',
    name: 'Khoa Xét nghiệm - CĐHA - TDCN',
    deptName: 'Khoa Xét nghiệm - CĐHA - TDCN',
    deptCode: 'K-XN',
    deptType: 'khoa',
    order: 16,
    role: 'author',
  },
  {
    code: 'khamdk',
    email: 'khamdk@cdcdanang.vn',
    name: 'Phòng khám đa khoa',
    deptName: 'Phòng khám đa khoa',
    deptCode: 'P-PKDK',
    deptType: 'phong',
    order: 17,
    role: 'author',
  },
];

// Danh sách các email cũ cần dọn dẹp (nếu có)
const OLD_EMAILS_TO_CLEANUP = [
  'kptchc@cdcdanang.vn', 'ptchcd@cdcdanang.vn', 'kpkhnv@cdcdanang.vn', 'pkhnvd@cdcdanang.vn',
  'kptckt@cdcdanang.vn', 'ptcktd@cdcdanang.vn', 'kpcbtn@cdcdanang.vn', 'kphiva@cdcdanang.vn',
  'kpchiv@cdcdanang.vn', 'kpbkln@cdcdanang.vn', 'kpcbln@cdcdanang.vn', 'kpdduo@cdcdanang.vn',
  'kdinhd@cdcdanang.vn', 'kpskmt@cdcdanang.vn', 'kskmty@cdcdanang.vn', 'kpbngn@cdcdanang.vn',
  'kbnghn@cdcdanang.vn', 'kpskss@cdcdanang.vn', 'kcssks@cdcdanang.vn', 'kpttgd@cdcdanang.vn',
  'kttgds@cdcdanang.vn', 'kpkstc@cdcdanang.vn', 'kkstct@cdcdanang.vn', 'kpkdyt@cdcdanang.vn',
  'kkdytq@cdcdanang.vn', 'kpdvty@cdcdanang.vn', 'kdvtyt@cdcdanang.vn', 'kpxncd@cdcdanang.vn',
  'kxncdh@cdcdanang.vn', 'kppkdk@cdcdanang.vn', 'pkdkdn@cdcdanang.vn',
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

  // 2. Dọn dẹp các email cũ không nằm trong danh sách 16 tài khoản chuẩn
  const validEmails = new Set(DEPARTMENT_ACCOUNTS.map(a => a.email));
  for (const oldEmail of OLD_EMAILS_TO_CLEANUP) {
    if (!validEmails.has(oldEmail)) {
      try {
        const oldUser = await payload.find({
          collection: 'users',
          where: { email: { equals: oldEmail } },
          limit: 1,
        });
        if (oldUser.totalDocs > 0) {
          await payload.delete({
            collection: 'users',
            id: oldUser.docs[0].id,
          });
          payload.logger.info(`[Seed] Removed redundant account: ${oldEmail}`);
        }
      } catch (e: any) {
        // ignore
      }
    }
  }

  // 3. Khởi tạo đúng duy nhất 16 tài khoản khoa phòng (mật khẩu: 118ldl, username 6 ký tự)
  for (const item of DEPARTMENT_ACCOUNTS) {
    const deptId = departmentMap.get(item.deptCode);

    try {
      const existing = await payload.find({
        collection: 'users',
        where: {
          or: [
            { username: { equals: item.code } },
            { email: { equals: item.email } },
          ],
        },
        limit: 1,
      });

      if (existing.totalDocs === 0) {
        await payload.create({
          collection: 'users',
          data: {
            username: item.code,
            email: item.email,
            password: '118ldl',
            name: item.name,
            role: item.role || 'author',
            department: deptId || undefined,
          },
        });
        payload.logger.info(`[Seed] Created department user: ${item.code} (${item.email})`);
      } else {
        const userDoc = existing.docs[0];
        await payload.update({
          collection: 'users',
          id: userDoc.id,
          data: {
            username: item.code,
            email: item.email,
            password: '118ldl',
            name: item.name,
            department: deptId || userDoc.department,
          },
        });
        payload.logger.info(`[Seed] Updated department user: ${item.code} (${item.email})`);
      }
    } catch (error: any) {
      payload.logger.error(`[Seed] Error seeding ${item.code}: ${error.message}`);
    }
  }
};
