import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { getUserId } from '@/utils/Tools.ts';
import { ObjectId } from 'mongodb';
import { mongoTimeToTimeString12h } from '@/utils/GeneralTools.ts';

// GET /api/student/enrollments/[id] - Obtener detalles de una inscripción específica
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = await getUserId(req);
    const enrollmentId = params.id;
    
    // Obtener colecciones
    const enrollmentsCollection = await getCollection('enrollments');
    const classesCollection = await getCollection('classes');
    
    // Verificar si la inscripción existe y pertenece al estudiante
    const enrollment = await enrollmentsCollection.findOne({
      _id: new ObjectId(enrollmentId),
      student_id: new ObjectId(studentId)
    });
    
    if (!enrollment) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 });
    }
    
    // Obtener información de la clase asociada
    const classData = await classesCollection.findOne({ _id: enrollment.class_id });

    
    // Devolver la inscripción con los datos de la clase
    return NextResponse.json({
      success: true,
      enrollment: {
        ...enrollment,
        class: classData ? {
          ...classData,
          startTime: mongoTimeToTimeString12h(classData.startTime),
          endTime: mongoTimeToTimeString12h(classData.endTime)
        } : null
      }
    });
    
  } catch (error: any) {
    console.error('Error al obtener detalles de inscripción:', error);
    return NextResponse.json({ 
      error: 'Error al procesar la solicitud',
      details: error.message
    }, { status: 500 });
  }
}
