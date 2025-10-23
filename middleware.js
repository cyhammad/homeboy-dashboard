import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get the auth cookie
  const authCookie = request.cookies.get('homeboy_admin_auth');
  
  // Check if user is authenticated
  const isAuthenticated = authCookie && authCookie.value;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/sign-up'];
  
  // If user is on a public route and is authenticated, redirect to dashboard
  if (publicRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
