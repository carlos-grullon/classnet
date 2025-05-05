import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    if (
        (pathname.startsWith('/login') || pathname.startsWith('/register')) &&
        request.cookies.get('sessionId')
    ) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (
        pathname.startsWith('/_next/static') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/api/login') ||
        pathname.startsWith('/api/register')
    ) {
        return NextResponse.next();
    }
    
    const loginRedirect = NextResponse.redirect(new URL('/login', request.url));
    
    const sessionId = request.cookies.get('sessionId');
    if (!sessionId) {
        return loginRedirect;
    }

    return NextResponse.next();
}
