import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/backupAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { payload, errorResponse } = await requireAdminUser(request);
  if (errorResponse) return errorResponse;

  await payload.updateGlobal({
    slug: 'backup-settings' as any,
    overrideAccess: true,
    data: {
      oauthEmail: '',
      oauthRefreshToken: '',
      oauthAccessToken: '',
      oauthTokenExpiry: '',
    },
  });

  return NextResponse.json({ disconnected: true });
}
