export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { seedAccounts, DEPARTMENT_ACCOUNTS } from '@/lib/seedAccounts';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    await seedAccounts(payload);

    return NextResponse.json({
      success: true,
      message: 'Đã khởi tạo thành công 16 tài khoản các khoa phòng!',
      accounts: DEPARTMENT_ACCOUNTS.map((a, idx) => ({
        stt: idx + 1,
        name: a.name,
        code: a.code,
        email: a.email,
        password: '118ldl',
        role: a.role,
        deptCode: a.deptCode,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
