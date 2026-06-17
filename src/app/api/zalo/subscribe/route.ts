import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, dob, cccd } = body;

    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Số điện thoại là bắt buộc.' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    // Kiểm tra số điện thoại đã tồn tại chưa (dùng phone làm key tạm nếu chưa có Zalo User ID)
    const existing = await payload.find({
      collection: 'zalo-followers',
      where: { phone: { equals: phone.trim() } },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      // Cập nhật thông tin nếu đã có
      const doc = existing.docs[0];
      await payload.update({
        collection: 'zalo-followers',
        id: doc.id,
        data: {
          fullName: fullName?.trim() || doc.fullName,
          dob: dob?.trim() || doc.dob,
          cccd: cccd?.trim() || doc.cccd,
        },
      });
      return NextResponse.json({ success: true, message: 'Thông tin của bạn đã được cập nhật.' });
    }

    // Tạo mới — dùng phone làm zaloUserId tạm thời (sẽ được cập nhật khi người dùng chat qua Webhook)
    await payload.create({
      collection: 'zalo-followers',
      data: {
        zaloUserId: `phone_${phone.trim()}`,
        phone: phone.trim(),
        fullName: fullName?.trim() || '',
        dob: dob?.trim() || '',
        cccd: cccd?.trim() || '',
        displayName: fullName?.trim() || phone.trim(),
        userType: 'citizen',
        accessLevel: 'basic',
        followedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Đăng ký nhận tin thành công! Chúng tôi sẽ liên hệ qua Zalo.' });
  } catch (err: any) {
    console.error('[/api/zalo/subscribe] Error:', err);
    return NextResponse.json({ error: err?.message || 'Lỗi máy chủ.' }, { status: 500 });
  }
}
