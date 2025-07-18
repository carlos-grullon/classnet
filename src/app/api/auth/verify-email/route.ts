import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';

// GET /api/auth/verify-email?token=...
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token requerido.' }, { status: 400 });
    }

    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ verification_token: token });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Token inválido o usuario no encontrado.' }, { status: 400 });
    }

    if (user.is_verified) {
      return NextResponse.json({ success: true, message: 'Correo ya verificado.' }, { status: 200 });
    }

    if (!user.verification_expires || new Date(user.verification_expires) < new Date()) {
      return NextResponse.json({ success: false, message: 'El token ha expirado. Solicita uno nuevo.' }, { status: 400 });
    }

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: { is_verified: true },
        $unset: { verification_token: '', verification_expires: '' },
      }
    );

    return NextResponse.json({ success: true, message: 'Correo verificado exitosamente.' }, { status: 200 });
  } catch (error) {
    console.error('Error en verify-email:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
} 