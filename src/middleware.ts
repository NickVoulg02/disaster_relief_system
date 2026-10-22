import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Support legacy .htaccess error page URLs (/errors/401.html & /errors/404.html)
  if (pathname === '/errors/401' || pathname === '/errors/401.html') {
    return NextResponse.rewrite(new URL('/unauthorized', request.url), { status: 401 });
  }
  if (pathname === '/errors/404' || pathname === '/errors/404.html') {
    return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 });
  }

  // Protected role portals
  const isAdminRoute = pathname.startsWith('/admin');
  const isVolunteerRoute = pathname.startsWith('/volunteer');
  const isCitizenRoute = pathname.startsWith('/citizen');

  if (isAdminRoute || isVolunteerRoute || isCitizenRoute) {
    const token = request.cookies.get('drs_session')?.value;
    if (!token) {
      // Unauthenticated access redirects to /login (per Chapter 3 of project spec)
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role mismatch shows 401 Unauthorized page
    if (
      (isAdminRoute && session.userType !== 'admin') ||
      (isVolunteerRoute && session.userType !== 'volunteer') ||
      (isCitizenRoute && session.userType !== 'citizen')
    ) {
      return NextResponse.rewrite(new URL('/unauthorized', request.url), { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/volunteer/:path*',
    '/citizen/:path*',
    '/errors/:path*',
  ],
};

