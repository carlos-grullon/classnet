import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  // Lista de rutas públicas que no requieren autenticación
  const publicPaths = [
    '/',
    '/faq',
    '/login',
    '/register',
    '/register/complete',
    '/api/login',
    '/api/register',
    '/api/logout',
    '/api/auth/google',
    '/api/auth/google/callback',
    '/api/auth/google/register',
    '/_next',
    '/favicon.ico',
    '/images',
    '/uploads/payment-proofs'
  ];

  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('AuthToken')?.value;
  
  // Permitir acceso a rutas públicas sin restricciones
  if (publicPaths.some(path => pathname.startsWith(path))) {
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      if (token) {
        try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
          const { payload } = await jwtVerify(token, secret);
          
          // Redirigir a la ruta correspondiente según el rol
          if (payload.userIsTeacher) {
            return NextResponse.redirect(new URL('/teacher', request.url));
          }else if (payload.userIsStudent) {
            return NextResponse.redirect(new URL('/student', request.url));
          }
          // Si no es ni estudiante ni profesor, redirigir a inicio
          return NextResponse.redirect(new URL('/', request.url));
        } catch (error) {
          // Si hay un error al verificar el token, redirigir a login
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }
      return NextResponse.next();
    }
    return NextResponse.next();
  }
  
  
  // Si no hay token, redirigir al login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Verificar el token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    
    // Si el token es válido pero no tiene la información necesaria
    if (!payload.userId || (!payload.userIsStudent && !payload.userIsTeacher)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Determinar el tipo de usuario y redirigir si es necesario
    const isStudent = payload.userIsStudent === true;
    const isTeacher = payload.userIsTeacher === true;
    
      // User has both roles - allow all routes
  if (isStudent && isTeacher) {
    return NextResponse.next();
  }
  // Restrict routes based on user type
  if (isStudent) {
    if (pathname.startsWith('/student') || 
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.js') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.svg')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/student', request.url));
  }

  if (isTeacher) {
    if (pathname.startsWith('/teacher') || 
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.js') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.svg')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/teacher', request.url));
  }
    
    // Si todo está bien, permitir el acceso
    return NextResponse.next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    // Si hay un error al verificar el token, redirigir al login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}