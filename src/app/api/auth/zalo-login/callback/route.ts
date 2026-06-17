/**
 * API: Xử lý callback sau khi người dùng đồng ý đăng nhập Zalo
 * GET /api/auth/zalo-login/callback?code=xxx&state=yyy
 *
 * Luồng:
 * 1. Xác thực state chống CSRF
 * 2. Đổi code → access_token bằng PKCE
 * 3. Lấy thông tin người dùng từ Zalo API
 * 4. Upsert vào ZaloFollowers collection trong Payload
 * 5. Set cookie zl_user để frontend nhận diện
 * 6. Redirect về trang chủ
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

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
  const { searchParams, origin } = req.nextUrl;
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/?zalo_login=denied`);
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/?zalo_login=no_code`);
  }

  // Xác thực state & verifier từ cookie
  const savedState    = req.cookies.get('zl_state')?.value;
  const savedVerifier = req.cookies.get('zl_verifier')?.value;

  if (!savedState || state !== savedState || !savedVerifier) {
    return NextResponse.redirect(`${origin}/?zalo_login=invalid_state`);
  }

  try {
    const appId     = await getConfig('zalo_app_id', process.env.ZALO_APP_ID);
    const appSecret = await getConfig('zalo_app_secret', process.env.ZALO_APP_SECRET);
    const callbackUrl = `${origin}/api/auth/zalo-login/callback`;

    // Bước 1: Đổi code lấy access_token
    const tokenRes = await fetch('https://oauth.zaloapp.com/v4/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: appSecret,
      },
      body: new URLSearchParams({
        code,
        app_id:        appId,
        grant_type:    'authorization_code',
        code_verifier: savedVerifier,
        redirect_uri:  callbackUrl,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error('[Zalo Login] Token error:', tokenData);
      return NextResponse.redirect(`${origin}/?zalo_login=token_error`);
    }

    // Bước 2: Lấy thông tin người dùng
    const profileRes = await fetch('https://graph.zalo.me/v2.0/me?fields=id,name,picture', {
      headers: { access_token: tokenData.access_token },
    });
    const profile = await profileRes.json();

    if (!profile.id) {
      console.error('[Zalo Login] Profile error:', profile);
      return NextResponse.redirect(`${origin}/?zalo_login=profile_error`);
    }

    // Bước 3: Upsert vào ZaloFollowers
    const payload = await getPayload({ config: configPromise });
    const existing = await payload.find({
      collection: 'zalo-followers',
      where: { zaloUserId: { equals: profile.id } },
      limit: 1,
    });

    let follower;
    if (existing.docs.length > 0) {
      follower = await payload.update({
        collection: 'zalo-followers',
        id: existing.docs[0].id,
        data: {
          displayName: profile.name || existing.docs[0].displayName,
          avatarUrl:   profile.picture?.data?.url || existing.docs[0].avatarUrl,
        },
      });
    } else {
      follower = await payload.create({
        collection: 'zalo-followers',
        data: {
          zaloUserId:  profile.id,
          displayName: profile.name || '',
          avatarUrl:   profile.picture?.data?.url || '',
          userType:    'citizen',
          accessLevel: 'basic',
          followedAt:  new Date(),
        },
      });
    }

    // Bước 4: Set cookie nhẹ cho frontend nhận diện (không nhạy cảm)
    const userPayload = JSON.stringify({
      id:          follower.id,
      zaloUserId:  profile.id,
      displayName: profile.name || '',
      avatarUrl:   profile.picture?.data?.url || '',
    });

    const response = NextResponse.redirect(`${origin}/?zalo_login=success`);
    response.cookies.set('zl_user', Buffer.from(userPayload).toString('base64'), {
      httpOnly: false, // Frontend cần đọc được
      maxAge:   60 * 60 * 24 * 7, // 7 ngày
      path:     '/',
      sameSite: 'lax',
    });
    // Xóa cookie tạm
    response.cookies.delete('zl_state');
    response.cookies.delete('zl_verifier');

    return response;
  } catch (err: any) {
    console.error('[Zalo Login Callback]', err);
    return NextResponse.redirect(`${origin}/?zalo_login=server_error`);
  }
}
