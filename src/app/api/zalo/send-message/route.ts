/**
 * API: Gửi tin nhắn CSKH tới một người dùng Zalo cụ thể
 * POST /api/zalo/send-message
 * Body: { zaloUserId, message }
 *
 * Chỉ dành cho nhân viên đã đăng nhập Portal.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

async function getZaloAccessToken(): Promise<string> {
  // Thử lấy từ ZaloSystemConfigs collection trước, fallback sang env
  try {
    const payload = await getPayload({ config: configPromise });
    const configs = await payload.find({
      collection: 'zalo-system-configs',
      where: { key: { equals: 'zalo_access_token' } },
      limit: 1,
    });
    if (configs.docs.length > 0 && (configs.docs[0] as any).value) {
      return (configs.docs[0] as any).value;
    }
  } catch {}
  return process.env.ZALO_ACCESS_TOKEN ?? '';
}

export async function POST(req: NextRequest) {
  // Kiểm tra auth (payload-token cookie)
  const token = req.cookies.get('payload-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
  }

  // Xác thực user
  const baseUrl = req.nextUrl.origin;
  const meRes = await fetch(`${baseUrl}/api/users/me`, {
    headers: { Authorization: `JWT ${token}` },
    cache: 'no-store',
  });
  if (!meRes.ok) {
    return NextResponse.json({ error: 'Không xác thực được người dùng.' }, { status: 401 });
  }
  const { user } = await meRes.json();
  if (!['admin', 'moderator', 'editor', 'author'].includes(user?.role)) {
    return NextResponse.json({ error: 'Không đủ quyền.' }, { status: 403 });
  }

  const { zaloUserId, message } = await req.json();
  if (!zaloUserId || !message?.trim()) {
    return NextResponse.json({ error: 'Thiếu zaloUserId hoặc nội dung tin nhắn.' }, { status: 400 });
  }

  const accessToken = await getZaloAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Chưa cấu hình Zalo Access Token.' }, { status: 500 });
  }

  // Gửi tin nhắn qua Zalo OA API
  const zaloRes = await fetch('https://openapi.zalo.me/v2.0/oa/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      access_token: accessToken,
    },
    body: JSON.stringify({
      recipient: { user_id: zaloUserId },
      message:   { text: message.trim() },
    }),
  });

  const zaloData = await zaloRes.json();

  if (zaloData.error !== 0) {
    return NextResponse.json(
      { error: zaloData.message || 'Zalo API trả về lỗi.', code: zaloData.error },
      { status: 502 }
    );
  }

  // Lưu log vào ZaloMessageLogs
  try {
    const payload = await getPayload({ config: configPromise });
    await payload.create({
      collection: 'zalo-message-logs',
      data: {
        zaloUserId,
        direction:  'outbound',
        type:       'text',
        content:    message.trim(),
        rawPayload: JSON.stringify({ sentBy: user.email, ...zaloData }),
        receivedAt: new Date(),
      },
    });
  } catch (logErr) {
    console.warn('[send-message] Log failed:', logErr);
  }

  return NextResponse.json({ success: true, message: 'Đã gửi tin nhắn thành công.' });
}
