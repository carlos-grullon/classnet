import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/utils/MongoDB';
import { addMonths } from 'date-fns';
import { sendClassStartNotification } from '@/utils/EmailService';
import { formatDateLong } from '@/utils/GeneralTools.ts';
import { v4 as uuidv4 } from 'uuid';

// POST /api/teacher/classes/[id]/start - Iniciar una clase
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const classId = (await params).id;
    if (!ObjectId.isValid(classId)) {
      return NextResponse.json({ error: 'ID de clase inválido' }, { status: 400 });
    }

    // Obtener la clase
    const classesCollection = await getCollection('classes');
    const classData = await classesCollection.findOne({ _id: new ObjectId(classId) });
    if (!classData) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 });
    }

    // Verificar que la clase esté en estado 'ready_to_start'
    if (classData.status !== 'ready_to_start') {
      return NextResponse.json({
        error: 'La clase no puede ser iniciada porque su estado actual es: ' + classData.status
      }, { status: 400 });
    }

    // Actualizar el estado de la clase a 'in_progress' y establecer la fecha de inicio
    const startDate = new Date();
    await classesCollection.updateOne(
      { _id: new ObjectId(classId) },
      {
        $set: {
          status: 'in_progress',
          startDate: startDate
        }
      }
    );
    const enrollmentsCollection = await getCollection('enrollments');

    // Preparar la fecha de vencimiento dentro de 7 días para los trial
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    expiresAt.setHours(23, 59, 59, 999);

    // Actualizar todas las inscripciones de estudiantes con estado 'enrolled' y 'trial'
    const enrollments = await enrollmentsCollection.find({
      class_id: new ObjectId(classId),
      status: { $in: ['enrolled', 'trial'] }
    }).toArray();

    // Procesar cada inscripción para establecer fechas de facturación
    for (const enrollment of enrollments) {
      if (enrollment.status === 'trial') {
        await enrollmentsCollection.updateOne(
          { _id: enrollment._id },
          {
            $set: {
              expiresAt: expiresAt
            }
          }
        );
      } else {
        const nextPaymentDueDate = addMonths(startDate, 1); // Próximo pago en 1 mes

        await enrollmentsCollection.updateOne(
          { _id: enrollment._id },
          {
            $set: {
              billingStartDate: startDate,
              nextPaymentDueDate: nextPaymentDueDate,
              priceAtEnrollment: enrollment.paymentAmount || classData.price,
              // Añadir el primer pago al historial (el de inscripción)
              paymentsMade: [{
                _id: uuidv4(),
                amount: enrollment.paymentAmount || classData.price,
                date: enrollment.updatedAt || new Date(),
                status: 'paid',
                notes: 'Pago inicial de inscripción',
                paymentDueDate: startDate
              }]
            }
          }
        );
        const usersCollection = await getCollection('users');

        // Obtener datos del estudiante para enviar notificación
        const student = await usersCollection.findOne({ _id: enrollment.student_id });
        if (student) {
          // Enviar notificación por correo al estudiante
          await sendClassStartNotification(
            student.email,
            student.username,
            classData.subjectName,
            classData.level,
            {
              startDate: formatDateLong(startDate),
              nextPaymentDate: formatDateLong(nextPaymentDueDate)
            }
          );
        }
      }
    }

    // Crear el contenido de la clase
    const classContentCollection = await getCollection('class_contents');
    await classContentCollection.insertOne({
      classId: new ObjectId(classId),
      welcomeMessage: '',
      whatsappLink: '',
      resources: [],
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Clase iniciada correctamente',
      startDate: startDate
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al iniciar la clase:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
