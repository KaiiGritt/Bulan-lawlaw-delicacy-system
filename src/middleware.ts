import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if user is logged in
  const isLoggedIn = !!token;
  const userEmail = token?.email as string | undefined;
  const emailVerified = token?.emailVerified as boolean | undefined;
  const userRole = token?.role as string | undefined;

  // Debug logging for production
  console.log('[Middleware]', {
    pathname,
    isLoggedIn,
    hasToken: !!token,
    userEmail,
    emailVerified,
    userRole,
    nextAuthUrl: process.env.NEXTAUTH_URL,
  });

  // Define public routes that anyone can access
  const publicRoutes = ['/products', '/recipes', '/contact'];

  // Define protected routes that require authentication
  const protectedRoutes = ['/profile', '/cart', '/checkout', '/orders', '/settings', '/addresses'];
  const authRoutes = ['/login', '/register'];
  const otpRoute = '/verify-otp';

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isOTPRoute = pathname.startsWith(otpRoute);
  const isAdminRoute = pathname.startsWith('/admin');

  // Home page is now accessible to everyone (removed login redirect)

  // If user is logged in but NOT email verified (except for OTP page and admin)
  if (isLoggedIn && !emailVerified && !isOTPRoute && userRole !== 'admin') {
    // Redirect to OTP verification
    const otpUrl = new URL('/verify-otp', request.url);
    otpUrl.searchParams.set('email', userEmail || '');
    return NextResponse.redirect(otpUrl);
  }

  // If user is logged in, verified, and trying to access auth routes, redirect to profile
  if (isLoggedIn && emailVerified && isAuthRoute) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // If user is logged in, verified, and trying to access OTP page, redirect to profile
  if (isLoggedIn && emailVerified && isOTPRoute) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // If user is not logged in and trying to access protected routes
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is trying to access OTP page without email parameter and not logged in
  if (isOTPRoute && !request.nextUrl.searchParams.get('email') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|uploads).*)',
  ],
};
