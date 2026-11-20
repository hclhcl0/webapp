import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getPublicOrigin, requireAdminUser } from '@/lib/backupAuth';

export const dynamic = 'force-dynamic';

function isEqualState(expected: string, received: string): boolean {
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(received, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const { payload, errorResponse } = await requireAdminUser(request);
  if (errorResponse) return errorResponse;

  const origin = getPublicOrigin(request);
  const adminPageUrl = `${origin}/admin/globals/backup-settings`;
  const url = new URL(request.url);

  const errorParam = url.searchParams.get('error');
  if (errorParam) {
    return NextResponse.redirect(
      `${adminPageUrl}?gdrive_error=${encodeURIComponent(`Google từ chối cấp quyền: ${errorParam}`)}`,
    );
  }

  const code = url.searchParams.get('code') || '';
  const state = url.searchParams.get('state') || '';
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('cdc_gdrive_oauth_state')?.value || '';

  if (!code || !state || !expectedState || !isEqualState(expectedState, state)) {
    return NextResponse.redirect(
      `${adminPageUrl}?gdrive_error=${encodeURIComponent('Phiên xác thực OAuth không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.')}`,
    );
  }

  try {
    const settings: any = await payload.findGlobal({
      slug: 'backup-settings' as any,
      overrideAccess: true,
    });

    const clientId = (settings?.oauthClientId || '').trim();
    const clientSecret = (settings?.oauthClientSecret || '').trim();
    if (!clientId || !clientSecret) {
      throw new Error('Thiếu Client ID hoặc Client Secret trong cấu hình.');
    }

    const redirectUri = `${origin}/api/backup/oauth/callback`;
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2.getToken(code);

    const refreshToken = tokens.refresh_token || settings?.oauthRefreshToken || '';
    if (!refreshToken) {
      throw new Error('Google không trả về Refresh Token. Hãy thử thu hồi quyền cũ và kết nối lại.');
    }

    oauth2.setCredentials({
      ...tokens,
      refresh_token: refreshToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2 });
    const about = await drive.about.get({ fields: 'user(emailAddress)' });
    const email = about.data.user?.emailAddress || '';

    await payload.updateGlobal({
      slug: 'backup-settings' as any,
      overrideAccess: true,
      data: {
        authMethod: 'oauth2',
        oauthEmail: email,
        oauthRefreshToken: refreshToken,
        oauthAccessToken: tokens.access_token || '',
        oauthTokenExpiry: tokens.expiry_date ? String(tokens.expiry_date) : '',
      },
    });

    const response = NextResponse.redirect(`${adminPageUrl}?gdrive=connected`);
    response.cookies.delete('cdc_gdrive_oauth_state');
    return response;
  } catch (err: any) {
    const response = NextResponse.redirect(
      `${adminPageUrl}?gdrive_error=${encodeURIComponent(err?.message || 'Lỗi trao đổi token Google Drive.')}`,
    );
    response.cookies.delete('cdc_gdrive_oauth_state');
    return response;
  }
}
