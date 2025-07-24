import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import { addDays, isBefore, isAfter, differenceInDays } from 'date-fns';
import { sendPaymentReminderEmail, sendPaymentOverdueEmail } from '@/utils/EmailService';
import { formatDateLong } from '@/utils/GeneralTools.ts';
import { Payment, Enrollment } from '@/interfaces/Enrollment'
import { getLevelName } from '@/utils/GeneralTools.ts';

// Clave secreta para proteger el endpoint de cron
const CRON_SECRET = process.env.CRON_SECRET;

// GET /api/cron/payment-reminders - Enviar recordatorios de pago
export async function GET(req: NextRequest) {
  try {
    // Validar la clave secreta del cron
    const authHeader = req.headers.get('authorization');
    const providedSecret = authHeader?.split(' ')[1];

    if (!providedSecret || providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const now = new Date();
    const enrollmentsCollection = await getCollection<Enrollment>('enrollments');
    const usersCollection = await getCollection('users');
    const classesCollection = await getCollection('classes');

    // Buscar inscripciones con estado 'enrolled' y con fecha de próximo pago establecida
    const enrollments = await enrollmentsCollection.find({
      status: 'enrolled',
      nextPaymentDueDate: { $exists: true }
    }).toArray();

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ message: 'No hay inscripciones que requieran recordatorios' }, { status: 200 });
    }

    // Obtener IDs únicos de estudiantes y clases
    const studentIds = [...new Set(enrollments.map(e => e.student_id))];
    const classIds = [...new Set(enrollments.map(e => e.class_id))];

    // Obtener todos los estudiantes y clases necesarios en dos consultas
    const [students, classes] = await Promise.all([
      usersCollection.find({ _id: { $in: studentIds.map(id => new ObjectId(id)) } }).toArray(),
      classesCollection.find({ _id: { $in: classIds.map(id => new ObjectId(id)) } }).toArray()
    ]);

    // Crear mapas para búsqueda rápida
    const studentMap = new Map(students.map(s => [s._id.toString(), s]));
    const classMap = new Map(classes.map(c => [c._id.toString(), c]));

    let remindersSent = 0;
    let overdueNoticesSent = 0;
    let missingDataCount = 0;

    for (const enrollment of enrollments) {
      const nextPaymentDate = new Date(enrollment.nextPaymentDueDate!);

      // Obtener datos del estudiante y la clase desde los mapas
      const student = studentMap.get(enrollment.student_id?.toString() || '');
      const classData = classMap.get(enrollment.class_id?.toString() || '');

      if (!student || !classData) {
        missingDataCount++;
        continue;
      }

      // 1. Enviar recordatorio 7 días antes del vencimiento
      if (differenceInDays(nextPaymentDate, now) === 7) {
        try {
          await sendPaymentReminderEmail(
            student.email,
            student.username || 'Estudiante',
            classData.subjectName,
            getLevelName(classData.level),
            {
              dueDate: formatDateLong(nextPaymentDate),
              amount: enrollment.priceAtEnrollment || classData.price,
              currency: classData.currency || 'DOP'
            }
          );
          remindersSent++;
        } catch (emailError) {
          console.error(`Error enviando recordatorio a ${student.email} (7 días):`, emailError);
          // Continuar con el siguiente registro aunque falle el envío
        }
      }

      // 2. Enviar recordatorio 1 día antes del vencimiento
      else if (differenceInDays(nextPaymentDate, now) === 1) {
        try {
          await sendPaymentReminderEmail(
            student.email,
            student.username || 'Estudiante',
            classData.subjectName,
            getLevelName(classData.level),
            {
              dueDate: formatDateLong(nextPaymentDate),
              amount: enrollment.priceAtEnrollment || classData.price,
              currency: classData.currency || 'DOP',
              urgent: true
            }
          );
          remindersSent++;
        } catch (emailError) {
          console.error(`Error enviando recordatorio urgente a ${student.email} (1 día):`, emailError);
          // Continuar con el siguiente registro aunque falle el envío
        }
      }

      // 3. Enviar notificación de pago vencido si han pasado 3 días desde la fecha de vencimiento
      else if (isAfter(now, addDays(nextPaymentDate, 3))) {

        // Verificar si ya se ha marcado como vencido para no enviar múltiples correos
        const isAlreadyMarkedOverdue = enrollment.paymentsMade?.some(
          (payment: Payment) => payment.status === 'overdue' &&
            payment.date && isBefore(new Date(payment.date), now) &&
            differenceInDays(now, new Date(payment.date)) < 7
        );

        if (!isAlreadyMarkedOverdue) {
          try {
            // Marcar el pago como vencido
            const newPayment: Payment = {
              _id: new ObjectId().toString(),
              amount: enrollment.priceAtEnrollment || classData.price,
              date: now.toISOString(),
              status: 'overdue',
              notes: 'Marcado automáticamente como vencido'
            };

            // Primero actualizamos el estado en la base de datos
            await enrollmentsCollection.updateOne(
              { _id: new ObjectId(enrollment._id) },
              {
                $push: { paymentsMade: newPayment },
                $set: {
                  status: 'payment_overdue',
                  lastUpdated: now.toISOString()
                }
              }
            );

            // Luego intentamos enviar el correo
            try {
              await sendPaymentOverdueEmail(
                student.email,
                student.username || 'Estudiante',
                classData.subjectName,
                getLevelName(classData.level),
                {
                  dueDate: formatDateLong(nextPaymentDate),
                  amount: enrollment.priceAtEnrollment || classData.price,
                  currency: classData.currency || 'DOP',
                  gracePeriod: 7 // Días de gracia antes de suspender
                }
              );
              overdueNoticesSent++;
            } catch (emailError) {
              console.error(`Error enviando notificación de pago vencido a ${student.email}:`, emailError);
              // Aunque falle el correo, la operación se considera exitosa porque actualizamos la base de datos
              overdueNoticesSent++;
            }
          } catch (dbError) {
            console.error('Error al actualizar el estado de pago vencido:', dbError);
            // Continuamos con el siguiente registro
          }
        }
      }

      // 4. Suspender al estudiante si han pasado más de 20 días desde la fecha de vencimiento
      else if (isAfter(now, addDays(nextPaymentDate, 20))) {
        // Solo suspender si no está ya suspendido
        if (enrollment.status !== 'suspended_due_to_non_payment') {
          await enrollmentsCollection.updateOne(
            { _id: enrollment._id },
            { $set: { status: 'suspended_due_to_non_payment' } }
          );

          // Aquí se podría enviar un correo adicional de suspensión
        }
      }
    }

    return NextResponse.json({
      message: 'Recordatorios enviados exitosamente',
      remindersSent,
      overdueNoticesSent,
      enrollmentsProcessed: enrollments.length - missingDataCount,
      enrollmentsWithMissingData: missingDataCount,
      processedAt: now.toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al procesar recordatorios de pago:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
