import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/backupAuth';
import { verifyGoogleDriveConnection } from '@/lib/googleDriveBackup';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { payload, errorResponse } = await requireAdminUser(request);
  if (errorResponse) return errorResponse;

  const stored: any = await payload.findGlobal({
    slug: 'backup-settings' as any,
    overrideAccess: true,
  });

  const body = await request.json().catch(() => ({}));
  const merged = {
    ...stored,
    ...(body?.authMethod ? { authMethod: body.authMethod } : {}),
    ...(typeof body?.oauthClientId === 'string' ? { oauthClientId: body.oauthClientId } : {}),
    ...(typeof body?.oauthClientSecret === 'string' ? { oauthClientSecret: body.oauthClientSecret } : {}),
    ...(typeof body?.serviceAccountJson === 'string' ? { serviceAccountJson: body.serviceAccountJson } : {}),
    ...(typeof body?.driveFolderInput === 'string' ? { driveFolderInput: body.driveFolderInput } : {}),
  };

  const result = await verifyGoogleDriveConnection(merged);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
