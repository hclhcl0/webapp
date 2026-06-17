/**
 * API: Khởi động Zalo Social Login
 * GET /api/auth/zalo-login
 *
 * Khác với OA OAuth (cấp quyền OA), đây là luồng đăng nhập người dùng (Social Login).
 * Dùng Zalo API: https://oauth.zaloapp.com/v4/permission
 * App ID được đọc từ DB (Cài đặt Zalo trong Admin) với fallback sang .env
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function generateCodeVerifier(): string {
  return crypto.randomBytes(64).toString('base64url').slice(0, 128);
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

/** Đọc config từ ZaloSystemConfigs (DB), fallback sang env */
async function getConfig(key: string, envFallback?: string): Promise<string> {
  try {
    const payload = await getPayload({ config: configPromise });
    const res = await payload.find({
      collection: 'zalo-system-configs',
      where: { key: { equals: key } },
      limit: 1,
    });
    const val = (res.docs[0] as any)?.value;
    if (val) return val;
  } catch {}
  return envFallback ?? '';
}

export async function GET(req: NextRequest) {
  try {
    const appId = await getConfig('zalo_app_id', process.env.ZALO_APP_ID);

    if (!appId) {
      return NextResponse.json(
        { error: 'Chưa cấu hình App ID. Vào Admin → Cài đặt Zalo → nhập App ID rồi Lưu.' },
        { status: 500 }
      );
    }

    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    const state = crypto.randomBytes(16).toString('hex');

    const callbackUrl = `${req.nextUrl.origin}/api/auth/zalo-login/callback`;

    const authUrl = new URL('https://oauth.zaloapp.com/v4/permission');
    authUrl.searchParams.set('app_id', appId);
    authUrl.searchParams.set('redirect_uri', callbackUrl);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('state', state);

    // Lưu verifier + state vào cookie tạm thời (10 phút)
    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set('zl_verifier', verifier, { httpOnly: true, maxAge: 600, path: '/', sameSite: 'lax' });
    response.cookies.set('zl_state', state, { httpOnly: true, maxAge: 600, path: '/', sameSite: 'lax' });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

