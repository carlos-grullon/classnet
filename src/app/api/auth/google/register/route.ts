import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { createUserSession } from '@/utils/GoogleAuth';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, username, user_type, image_path } = data;

    if (email !== 'carlos0012010vegano@gmail.com' && user_type === 'P') {
      return NextResponse.json(
        { success: false, message: 'No se pueden ingresar como profesores todavía' },
        { status: 401 }
      );
    }

    if (!email || !username || !user_type) {
      return NextResponse.json(
        { success: false, message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');

    // Verificar si el usuario ya existe
    let user = await usersCollection.findOne({ email });

    if (user) {
      // Si el usuario ya existe pero está intentando agregar un nuevo rol
      if (user_type === 'E' && !user.user_is_student) {
        await usersCollection.updateOne(
          { email },
          { $set: { user_is_student: true } }
        );
      } else if (user_type === 'P' && !user.user_is_teacher) {
        await usersCollection.updateOne(
          { email },
          { $set: { user_is_teacher: true } }
        );
      }

      // Actualizar información del usuario si viene de Google
      await usersCollection.updateOne(
        { email },
        {
          $set: {
            image_path: image_path || user.image_path,
            updated_at: new Date()
          }
        }
      );
    } else {
      // Crear nuevo usuario
      await usersCollection.insertOne({
        username,
        email,
        user_is_student: user_type === 'E',
        user_is_teacher: user_type === 'P',
        image_path: image_path || '',
        status: 'A',
        country: '',
        description: '',
        data: user_type === 'P' ? {
          subjects: [],
          reviews: [],
          rating: 0,
        } : {},
        created_at: new Date(),
        updated_at: new Date(),
        has_used_trial: false,
        lastNotificationView: new Date(),
        auth_provider: 'google'
      });
    }

    // Obtener el usuario actualizado
    user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Error al crear el usuario' },
        { status: 500 }
      );
    }

    // Crear token JWT para la sesión
    const token = await createUserSession(user);

    // Crear respuesta y establecer cookie
    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        username: user.username,
        user_type: user.user_is_teacher ? 'P' : 'E',
        image_path: user.image_path
      }
    });

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
    console.error('Error en el registro con Google:', error);
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
