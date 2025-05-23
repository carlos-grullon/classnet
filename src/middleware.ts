import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const publicPaths = [
    '/login',
    '/register',
    '/api/login',
    '/api/register',
    '/_next/static',
    '/favicon.ico'
  ];

  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('AuthToken')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  return NextResponse.next();
}
