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

  // If user is not logged in and trying to access the home page, redirect to login
  if (!isLoggedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and trying to access auth routes, redirect to home
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not logged in and trying to access protected routes
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
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
