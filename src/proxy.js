import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/leads') || 
                          pathname.startsWith('/shops') || 
                          pathname.startsWith('/visits') || 
                          pathname.startsWith('/tasks') || 
                          pathname.startsWith('/pipeline') || 
                          pathname.startsWith('/trials') || 
                          pathname.startsWith('/subscriptions') || 
                          pathname.startsWith('/reports') || 
                          pathname.startsWith('/team') || 
                          pathname.startsWith('/analytics') || 
                          pathname.startsWith('/documents') || 
                          pathname.startsWith('/settings');

  // Login page path
  const isLoginRoute = pathname === '/login';

  if (isProtectedRoute && !token) {
    // Redirect to login if trying to access protected route without token
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && token) {
    // Redirect to dashboard if logged in and trying to access login page
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/leads/:path*',
    '/shops/:path*',
    '/visits/:path*',
    '/tasks/:path*',
    '/pipeline/:path*',
    '/trials/:path*',
    '/subscriptions/:path*',
    '/reports/:path*',
    '/team/:path*',
    '/analytics/:path*',
    '/documents/:path*',
    '/settings/:path*',
    '/login',
  ],
};
