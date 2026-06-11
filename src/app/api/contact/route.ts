import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, organization, subject, message } = body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc (họ tên, email, chủ đề, nội dung).' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Địa chỉ email không hợp lệ.' }, { status: 400 });
    }

    // Save to Payload CMS
    const payload = await getPayload({ config: configPromise });
    await payload.create({
      collection: 'form-submissions',
      data: {
        name,
        email,
        phone: phone || '',
        organization: organization || '',
        subject,
        message,
        status: 'new',
      },
      overrideAccess: true,
    });

    return NextResponse.json({ success: true, message: 'Đã gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.' });
  } catch (err) {
    console.error('[Contact API] Error:', err);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi gửi thông tin. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
