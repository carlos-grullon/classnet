import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { sendVerificationEmail } from '@/utils/EmailService';
import crypto from 'crypto';

// POST /api/auth/resend-verification
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ message: 'Email requerido.' }, { status: 400 });
    }

    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ email });

    // Por seguridad, responde 200 aunque no exista
    if (!user) {
      return NextResponse.json({ success: true, message: 'Correo de verificación enviado.' }, { status: 200 });
    }

    // Si ya está verificado
    if (user.is_verified) {
      return NextResponse.json({ success: true, message: 'Ya verificado, inicia sesión.' }, { status: 200 });
    }

    // Rate limit: 1 cada 60s
    const now = new Date();
    if (user.email_sent_at && now.getTime() - new Date(user.email_sent_at).getTime() < 60 * 1000) {
      return NextResponse.json({ success: false, message: 'Espera antes de reenviar el correo de verificación.' }, { status: 429 });
    }

    // Genera nuevo token y expiración
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora

    await usersCollection.updateOne(
      { email },
      {
        $set: {
          verification_token: token,
          verification_expires: expires,
          email_sent_at: now,
        },
      }
    );

    await sendVerificationEmail(email, token);

    return NextResponse.json({ success: true, message: 'Correo de verificación enviado.' }, { status: 200 });
  } catch (error) {
    console.error('Error en resend-verification:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
} 