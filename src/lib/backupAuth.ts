import { NextResponse } from 'next/server';
import { getPayload, type Payload } from 'payload';
import configPromise from '@payload-config';
import { getUserRole } from './rbac';

export interface AdminAuthResult {
  payload: Payload;
  user: any | null;
  errorResponse: NextResponse | null;
}

/**
 * Verify that the incoming request belongs to an authenticated Payload admin user.
 */
export async function requireAdminUser(request: Request): Promise<AdminAuthResult> {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: request.headers });
  const role = getUserRole(user);

  if (!user) {
    return {
      payload,
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Chưa đăng nhập phiên quản trị.' },
        { status: 401 },
      ),
    };
  }

  if (role !== 'admin') {
    return {
      payload,
      user,
      errorResponse: NextResponse.json(
        { error: 'Chỉ tài khoản Quản trị viên (Admin) mới có quyền thao tác Sao lưu & Khôi phục.' },
        { status: 403 },
      ),
    };
  }

  return { payload, user, errorResponse: null };
}

/**
 * Resolve the public origin URL (handles Traefik/Coolify reverse proxy headers safely).
 */
export function getPublicOrigin(request: Request): string {
  const envUrl = (process.env.NEXT_PUBLIC_SERVER_URL || '').trim().replace(/\/$/, '');
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl;
  }

  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost) {
    const host = forwardedHost.split(',')[0].trim();
    const proto = forwardedProto.split(',')[0].trim();
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}
