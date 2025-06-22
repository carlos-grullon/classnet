import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/utils/MongoDB';
import { getUserId } from '@/utils/Tools.ts';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request);
    const classId = params.id;

    // Verificar que la clase exista y pertenezca al profesor
    const classesCollection = await getCollection('classes');
    const classData = await classesCollection.findOne({
      _id: new ObjectId(classId),
      teacher_id: new ObjectId(userId)
    });

    if (!classData) {
      return NextResponse.json({ error: 'Clase no encontrada o no tienes permisos' }, { status: 404 });
    }

    // Obtener las inscripciones de estudiantes para esta clase
    const enrollmentsCollection = await getCollection('enrollments');
    const enrollments = await enrollmentsCollection.find({
      class_id: new ObjectId(classId),
      status: 'enrolled'
    }).toArray();

    if (enrollments.length === 0) {
      return NextResponse.json({ students: [] });
    }

    // Obtener los IDs de estudiantes
    const studentIds = enrollments.map(enrollment => enrollment.student_id);

    // Obtener los datos de los estudiantes
    const usersCollection = await getCollection('users');
    const students = await usersCollection.find({
      _id: { $in: studentIds.map(id => new ObjectId(id)) }
    }, {
      projection: {
        _id: 1,
        username: 1,
        email: 1,
        profilePicture: 1
      }
    }).toArray();

    return NextResponse.json({ students });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al obtener estudiantes de la clase:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
