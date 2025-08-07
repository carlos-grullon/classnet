import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { getUserId } from "@/utils/Tools.ts";
import { ObjectId } from 'mongodb';
import { sendNotification } from '@/services/notificationService'
import { getLevelName, formatInputDateToLong } from '@/utils/GeneralTools.ts';


// POST /api/student/trial - Crear una nueva inscripción (prueba)
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
      status: { $in: ['enrolled', 'trial'] }
    });

    if (enrolledStudents >= maxStudents) {
      return NextResponse.json({ error: 'El número máximo de estudiantes para esta clase ha sido alcanzado' }, { status: 409 });
    }

    // Verificar si la clase ya empezó para poner la expiracion despues de 7 días
    let expiresAt = null;
    if (classData.status === 'in_progress') {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      expiresAt.setHours(23, 59, 59, 999);
    }

    // Obtener datos del estudiante para el correo
    // const usersCollection = await getCollection('users');
    // const student = await usersCollection.findOne<User>({ _id: new ObjectId(studentId) });

    const now = new Date();

    // Crear nueva inscripción
    const newEnrollment = {
      student_id: new ObjectId(studentId),
      class_id: new ObjectId(classId),
      status: 'trial',
      paymentAmount: classData.price,
      expiresAt: expiresAt,
      createdAt: now,
      updatedAt: now
    };

    // Actualizar el usuario porque ya usó la prueba gratuita
    const userCollection = await getCollection('users');
    await userCollection.updateOne({ _id: new ObjectId(studentId) }, { $set: { has_used_trial: true } });
    const result = await enrollmentsCollection.insertOne(newEnrollment);

    // Enviar notificación al estudiante
    const levelName = getLevelName(classData.level);
    await sendNotification({
      userId: [studentId],
      title: '🎉 Inscripción a clase de prueba',
      message: `Has sido inscrito a la clase de ${classData.subjectName} ${levelName}, tu período de prueba termina ${expiresAt ? 'el ' + formatInputDateToLong(expiresAt) : '7 días después que empiece la clase'}`,
      link: `/student/enrollments/${result.insertedId}`,
      type: 'info'
    });

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