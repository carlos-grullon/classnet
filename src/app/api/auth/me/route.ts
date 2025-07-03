import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { getUserId } from '@/utils/Tools.ts';
import { ObjectId } from 'mongodb';

// GET /api/auth/me - Obtener información del usuario autenticado
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    return NextResponse.json(
        {
        success: true,
        user : {
        userIsStudent: user?.user_is_student,
        userIsTeacher: user?.user_is_teacher,
        userEmail: user?.email,
        userImage: user?.image_path || '',
        userName: user?.username || '',
        }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Error al obtener información del usuario' 
    }, { status: 500 });
  }
}
