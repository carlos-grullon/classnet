import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    
    // Rutas públicas
    const publicPaths = [
        '/',
        '/login',
        '/register', 
        '/api/login',
        '/api/register',
        '/_next/static', 
        '/favicon.ico',
        '/api/session',
    ];
    
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }
    
    const IdSession = request.cookies.get('IdSession')?.value;
    
    if (!IdSession) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}
