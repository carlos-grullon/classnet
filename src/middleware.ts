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
  const token = request.cookies.get('AuthToken')?.value;

  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
      if (token) return NextResponse.redirect(new URL('/', request.url));
      return NextResponse.next();
    }
    return NextResponse.next();
  }
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  return NextResponse.next();
}
