import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pathname = req.nextUrl.pathname;

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isProtectedRoute =
    pathname === '/' ||
    pathname === '/profile' ||
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/team') ||
    pathname.startsWith('/leaderboard') ||
    pathname.startsWith('/settings');

  // 1. If already authenticated and trying to view /login or /register, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 2. If unauthenticated and trying to view a protected route, redirect to /login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/profile',
    '/login',
    '/register',
    '/tasks/:path*',
    '/projects/:path*',
    '/team/:path*',
    '/leaderboard/:path*',
    '/settings/:path*',
  ],
};
