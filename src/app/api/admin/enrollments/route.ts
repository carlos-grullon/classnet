import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { getUserId } from '@/utils/Tools.ts';
import { ObjectId } from 'mongodb';

// GET /api/admin/enrollments - Obtener inscripciones con paginación y filtros
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación y rol de administrador
    const userId = await getUserId(req);
    
    // Verificar que el usuario sea administrador
    const usersCollection = await getCollection('users');
    const admin = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Parámetros de paginación y filtro
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1')); // Asegurar que page sea al menos 1
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '10')); // Asegurar que limit sea al menos 1
    const skip = (page - 1) * limit;
    const status = url.searchParams.get('status') || '';
    
    // Construir filtro
    const filter: { status?: string } = {};
    if (status) {
      filter.status = status;
    }
    
    // Obtener colecciones
    const enrollmentsCollection = await getCollection('enrollments');
    const classesCollection = await getCollection('classes');
    
    // Obtener inscripciones
    const enrollments = await enrollmentsCollection.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Obtener información de estudiantes y clases para cada inscripción
    const populatedEnrollments = await Promise.all(enrollments.map(async (enrollment) => {
      // Obtener datos del estudiante
      const student = await usersCollection.findOne({ _id: new ObjectId(enrollment.student_id) });
      
      // Obtener datos de la clase
      const classData = await classesCollection.findOne({ _id: new ObjectId(enrollment.class_id) });
      
      // Construir el objeto con la estructura exacta que espera el frontend
      return {
        id: enrollment._id.toString(),
        status: enrollment.status,
        createdAt: enrollment.createdAt,
        updatedAt: enrollment.updatedAt,
        expiresAt: enrollment.expiresAt,
        paymentAmount: enrollment.paymentAmount,
        paymentProof: enrollment.paymentProof,
        notes: enrollment.notes,
        student: {
          _id: student?._id.toString(),
          name: student?.name || student?.username || '',
          lastName: student?.lastName || '',
          email: student?.email || ''
        },
        class: {
          _id: classData?._id.toString(),
          name: classData?.name || '',
          subjectName: classData?.subjectName || '',
          teacherName: classData?.teacherName || '',
          price: classData?.price || 0,
          level: classData?.level || ''
        }
      };
    }));
    
    // Contar total para paginación
    const total = await enrollmentsCollection.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      enrollments: populatedEnrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener inscripciones:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error al obtener inscripciones' 
    }, { status: 500 });
  }
}
