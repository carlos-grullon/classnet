import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    
    // Páginas públicas que no requieren autenticación
    const publicPaths = [
        '/login', 
        '/register', 
        '/api/auth',
        '/_next/static', 
        '/favicon.ico',
    ];
    
    // Si la ruta es pública, continuar sin verificar autenticación
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }
    
    // Redirigir a login si no hay sesión autenticada
    const loginRedirect = NextResponse.redirect(new URL('/login', request.url));
    
    const sessionId = request.cookies.get('sessionId');
    if (!sessionId) {
        return loginRedirect;
    }
    
    // Redireccionar a diferentes dashboards dependiendo del rol del usuario
    // if (pathname === '/') {
    //     const userIsStudent = token.userIsStudent;
    //     const userIsTeacher = token.userIsTeacher;
        
    //     if (userIsStudent && userIsTeacher) {
    //         return NextResponse.redirect(new URL('/', request.url));
    //     }
    //     if (userIsStudent) {
    //         return NextResponse.redirect(new URL('/student/dashboard', request.url));
    //     }
    //     if (userIsTeacher) {
    //         return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
    //     }
    // }

    return NextResponse.next();
}
