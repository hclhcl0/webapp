import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getPublicOrigin, requireAdminUser } from '@/lib/backupAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { payload, errorResponse } = await requireAdminUser(request);
  if (errorResponse) return errorResponse;

  const origin = getPublicOrigin(request);
  const adminPageUrl = `${origin}/admin/globals/backup-settings`;

  const settings: any = await payload.findGlobal({
    slug: 'backup-settings' as any,
    overrideAccess: true,
  });

  const clientId = (settings?.oauthClientId || '').trim();
  const clientSecret = (settings?.oauthClientSecret || '').trim();

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${adminPageUrl}?gdrive_error=${encodeURIComponent('Vui lòng nhập Client ID và Client Secret rồi bấm Lưu trước khi kết nối Google Drive.')}`,
    );
  }

  const redirectUri = `${origin}/api/backup/oauth/callback`;
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const state = crypto.randomBytes(24).toString('hex');

  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive'],
    state,
  });

  const response = NextResponse.redirect(authUrl);
  response.cookies.set('cdc_gdrive_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: origin.startsWith('https://'),
    path: '/api/backup/oauth',
    maxAge: 600,
  });
  return response;
}
