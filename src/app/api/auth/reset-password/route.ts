import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { HashPassword } from '@/utils/Tools.ts';

// POST /api/auth/reset-password
// Body: { token: string, password: string }
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, message: 'Token y contraseña son requeridos.' }, { status: 400 });
    }

    const users = await getCollection('users');
    const user = await users.findOne({ reset_token: token });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Token inválido.' }, { status: 400 });
    }

    if (!user.reset_expires || new Date(user.reset_expires) < new Date()) {
      return NextResponse.json({ success: false, message: 'El token ha expirado. Solicita uno nuevo.' }, { status: 400 });
    }

    const hashed = await HashPassword(password);

    await users.updateOne(
      { _id: user._id },
      {
        $set: { password: hashed },
        $unset: { reset_token: '', reset_expires: '', reset_requested_at: '' }
      }
    );

    return NextResponse.json({ success: true, message: 'Contraseña restablecida correctamente.' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
}
