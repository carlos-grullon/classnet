import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/utils/EmailService';

// POST /api/auth/request-password-reset
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email requerido.' }, { status: 400 });
    }

    const users = await getCollection('users');
    const user = await users.findOne({ email });

    // Siempre responder 200 para no filtrar existencia de usuarios
    if (!user) {
      return NextResponse.json({ success: true, message: 'Si el correo existe, enviaremos un enlace para restablecer la contraseña.' });
    }

    const now = new Date();
    // Rate limit: 1 solicitud por minuto
    if (user.reset_requested_at && now.getTime() - new Date(user.reset_requested_at).getTime() < 60 * 1000) {
      return NextResponse.json({ success: false, message: 'Espera antes de solicitar otro correo de restablecimiento.' }, { status: 429 });
    }

    // Generar token y expiración
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          reset_token: token,
          reset_expires: expires,
          reset_requested_at: now,
        },
      }
    );

    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ success: true, message: 'Si el correo existe, enviaremos un enlace para restablecer la contraseña.' });
  } catch (error) {
    console.error('Error en request-password-reset:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
}
