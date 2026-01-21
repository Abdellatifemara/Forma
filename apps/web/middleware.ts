import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/app', '/trainer', '/admin'];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ['/login', '/signup', '/forgot-password'];

// Role-based route protection
const roleRoutes = {
  trainer: ['/trainer'],
  admin: ['/admin'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie (set by auth)
  const token = request.cookies.get('forma-token')?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth route with token
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url));
  }

  // For role-based routes, we'll handle this client-side
  // since we need to decode the token to get the role

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
