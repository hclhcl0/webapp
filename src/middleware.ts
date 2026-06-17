import { NextRequest, NextResponse } from 'next/server';

// Danh sách route yêu cầu đăng nhập Portal
const PORTAL_PROTECTED = '/portal';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Chỉ xử lý các route /portal (trừ /portal/login)
  if (pathname.startsWith(PORTAL_PROTECTED) && !pathname.startsWith('/portal/login')) {
    const token = req.cookies.get('payload-token')?.value;

    if (!token) {
      const loginUrl = new URL('/portal/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Xác thực token với Payload API
    try {
      const baseUrl = req.nextUrl.origin;
      const meRes = await fetch(`${baseUrl}/api/users/me`, {
        headers: { Authorization: `JWT ${token}` },
        cache: 'no-store',
      });

      if (!meRes.ok) {
        const loginUrl = new URL('/portal/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const meData = await meRes.json();
      const user = meData?.user;

      // Chỉ cho phép admin, moderator, editor, author vào Portal
      const allowedRoles = ['admin', 'moderator', 'editor', 'author'];
      if (!user || !allowedRoles.includes(user.role)) {
        const loginUrl = new URL('/portal/login', req.url);
        loginUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL('/portal/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*'],
};
