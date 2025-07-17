import { NextRequest, NextResponse } from 'next/server';
import { getGoogleTokens, getGoogleUserInfo, createUserSession } from '@/utils/GoogleAuth';
import { getCollection } from '@/utils/MongoDB';

export async function GET(request: NextRequest) {
  try {
    // Obtener el código de autorización de la URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=NoAuthorizationCode', request.url));
    }

    // Intercambiar el código por tokens
    const { access_token, id_token } = await getGoogleTokens(code);
    
    if (!access_token || !id_token) {
      return NextResponse.redirect(new URL('/login?error=NoAccessToken', request.url));
    }

    // Obtener información del usuario
    const googleUser = await getGoogleUserInfo(access_token);
    
    if (!googleUser || !googleUser.email) {
      return NextResponse.redirect(new URL('/login?error=NoUserInfo', request.url));
    }

    // Buscar o crear usuario en la base de datos
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ email: googleUser.email });

    if (!user) {
      // Si es la primera vez que el usuario inicia sesión con Google,
      // redirigir a una página para completar el registro
      // (elegir si es estudiante o profesor)
      const redirectUrl = `/register/complete?email=${encodeURIComponent(googleUser.email)}&name=${encodeURIComponent(googleUser.name)}&picture=${encodeURIComponent(googleUser.picture)}`;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Crear token JWT para la sesión
    const token = await createUserSession(user);
    
    let redirectUrl = '/student';
    if (user.user_is_teacher) {
      redirectUrl = '/teacher';
    }
    
    // Crear una respuesta con redirección y establecer la cookie httpOnly
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));
    
    // Establecer la cookie de autenticación como httpOnly
    response.cookies.set({
      name: 'AuthToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });
    
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error en el callback de Google:', error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
  }
}
