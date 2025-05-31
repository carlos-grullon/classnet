import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from "jose";

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
  const tokenCached = request.cookies.get('TokenCached')?.value;
  const pathname = request.nextUrl.pathname;

  if (publicPaths.some(path => pathname.startsWith(path))) {
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      if (token) return NextResponse.redirect(new URL('/', request.url));
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  let payload;
  if (tokenCached === token) {
    payload = JSON.parse(request.cookies.get('TokenPayload')?.value || '{}');
  } else {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload: verifiedPayload } = await jwtVerify(token, secret);
    payload = verifiedPayload;
    
    const response = NextResponse.next();
    response.cookies.set('TokenCached', token, { httpOnly: true, sameSite: 'strict' });
    response.cookies.set('TokenPayload', JSON.stringify(payload), { httpOnly: true, sameSite: 'strict' });
    return response;
  }

  if (!payload.userId || !payload.userIsStudent || !payload.userIsTeacher) {
    request.cookies.delete('TokenCached');
    request.cookies.delete('TokenPayload');
    request.cookies.delete('AuthToken');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isStudent = payload.userIsStudent === true;
  const isTeacher = payload.userIsTeacher === true;

  // User has both roles - allow all routes
  if (isStudent && isTeacher) {
    return NextResponse.next();
  }

  // Handle root path redirects
  if (pathname === '/') {
    if (isStudent) return NextResponse.redirect(new URL('/student', request.url));
    if (isTeacher) return NextResponse.redirect(new URL('/teacher', request.url));
  }

  // Restrict routes based on user type
  if (isStudent) {
    if (pathname.startsWith('/student') || 
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.js')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/student', request.url));
  }

  if (isTeacher) {
    if (pathname.startsWith('/teacher') || 
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.js')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/teacher', request.url));
  }

  return NextResponse.next();
}