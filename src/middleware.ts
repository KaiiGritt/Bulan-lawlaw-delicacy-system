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

  // Define protected routes that require authentication
  const protectedRoutes = ['/profile', '/cart', '/checkout', '/orders', '/settings', '/addresses'];
  const authRoutes = ['/login', '/register'];
  const otpRoute = '/verify-otp';

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isOTPRoute = pathname.startsWith(otpRoute);

  // If user is logged in and trying to access auth routes
  if (isLoggedIn && isAuthRoute) {
    // Check if OTP is verified
    const otpVerified = request.cookies.get('otp_verified')?.value === 'true';

    if (!otpVerified && userEmail) {
      // Redirect to OTP verification
      return NextResponse.redirect(new URL(`/verify-otp?email=${encodeURIComponent(userEmail)}`, request.url));
    }

    // Already logged in and verified, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not logged in and trying to access protected routes
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in but trying to access OTP page without needing verification
  if (isOTPRoute && isLoggedIn) {
    const otpVerified = request.cookies.get('otp_verified')?.value === 'true';

    // If already verified, redirect to home
    if (otpVerified) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If user is trying to access OTP page without email parameter
  if (isOTPRoute && !request.nextUrl.searchParams.get('email')) {
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
