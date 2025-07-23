import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { getUserId } from "@/utils/Tools.ts";
import { ObjectId } from 'mongodb';

// POST /api/student/enrollments - Crear una nueva inscripción (pendiente de pago)
export async function POST(req: NextRequest) {
  try {
    const studentId = await getUserId(req);
    const body = await req.json();
    const { classId }: { classId: string } = body;
    
    if (!classId) {
      return NextResponse.json({ error: 'ID de clase requerido' }, { status: 400 });
    }
    
    // Obtener colecciones
    const classesCollection = await getCollection('classes');
    const enrollmentsCollection = await getCollection('enrollments');
    
    // Verificar si la clase existe
    const classData = await classesCollection.findOne({ _id: new ObjectId(classId) });
    if (!classData) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 });
    }
    
    // Verificar si ya existe una inscripción para este estudiante y clase
    const existingEnrollment = await enrollmentsCollection.findOne({
      student_id: new ObjectId(studentId),
      class_id: new ObjectId(classId)
    });
    
    if (existingEnrollment) {
      return NextResponse.json({ 
        error: 'Ya existe una inscripción para esta clase',
        enrollmentId: existingEnrollment._id,
        status: existingEnrollment.status
      }, { status: 409 });
    }
    
    // Verificar el máximo de estudiantes
    const maxStudents = classData.maxStudents;
    const enrolledStudents = await enrollmentsCollection.countDocuments({
      class_id: new ObjectId(classId),
      status: 'enrolled'
    });

    if (enrolledStudents >= maxStudents) {
      return NextResponse.json({ error: 'El número máximo de estudiantes para esta clase ha sido alcanzado' }, { status: 409 });
    }

    // Calcular fecha de expiración (48 horas)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    // Crear nueva inscripción
    const newEnrollment = {
      student_id: new ObjectId(studentId),
      class_id: new ObjectId(classId),
      status: 'pending_payment',
      paymentAmount: classData.price,
      expiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await enrollmentsCollection.insertOne(newEnrollment);

    // Actualizar el usuario porque ya no necesita la prueba gratuita
    const userCollection = await getCollection('users');
    await userCollection.updateOne({ _id: new ObjectId(studentId) }, { $set: { has_used_trial: true } });
    
    return NextResponse.json({
      success: true,
      message: 'Inscripción creada exitosamente',
      enrollmentId: result.insertedId,
      expiresAt: expiresAt
    }, { status: 201 });
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al crear inscripción:', error);
    return NextResponse.json({ 
      error: 'Error al procesar la solicitud',
      details: message
    }, { status: 500 });
  }
}

// GET /api/student/enrollments - Obtener todas las inscripciones del estudiante
export async function GET(req: NextRequest) {
  try {
    const studentId = await getUserId(req);
    
    // Parámetros de paginación
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Obtener colecciones
    const enrollmentsCollection = await getCollection('enrollments');
    const classesCollection = await getCollection('classes');
    
    // Obtener inscripciones del estudiante
    const enrollments = await enrollmentsCollection.find({ 
      student_id: new ObjectId(studentId) 
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
    
    // Obtener información de las clases para cada inscripción
    const populatedEnrollments = await Promise.all(enrollments.map(async (enrollment) => {
      const classData = await classesCollection.findOne({ _id: enrollment.class_id });
      return {
        ...enrollment,
        class: classData
      };
    }));
    
    // Contar total para paginación
    const total = await enrollmentsCollection.countDocuments({ student_id: new ObjectId(studentId) });
    
    return NextResponse.json({
      success: true,
      enrollments: populatedEnrollments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al obtener inscripciones:', error);
    return NextResponse.json({ 
        error: 'Error al procesar la solicitud',
      details: message
    });
  }
}
