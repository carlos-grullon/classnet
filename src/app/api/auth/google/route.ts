import { NextResponse } from 'next/server';
import { getGoogleAuthURL } from '@/utils/GoogleAuth';

// Esta ruta redirige al usuario a la página de autenticación de Google
export async function GET() {
  try {
    const googleAuthURL = getGoogleAuthURL();
    return NextResponse.redirect(googleAuthURL);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
