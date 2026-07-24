import { NextResponse } from 'next/server';

// Next.js 16: Proxy files must export a function named 'proxy'
export function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isLoginRoute = pathname === '/login';

  // If on login page with valid token → redirect to dashboard
  if (isLoginRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If NOT on login page and no token → redirect to login
  if (!isLoginRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // All other requests proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icon, manifest, sw.js (PWA files)
     * - /api routes (handled server-side separately)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icon|manifest\\.json|sw\\.js|api/).*)',
  ],
};
