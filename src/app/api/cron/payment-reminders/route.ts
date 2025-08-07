import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import { addDays, isBefore, isAfter, differenceInDays } from 'date-fns';
import { sendPaymentReminderEmail, sendPaymentOverdueEmail } from '@/utils/EmailService';
import { formatDateLong } from '@/utils/GeneralTools.ts';
import { Payment, Enrollment } from '@/interfaces/Enrollment'
import { getLevelName } from '@/utils/GeneralTools.ts';
import { sendNotification } from '@/services/notificationService';

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
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const today = new Date(endOfDay.getTime());

    const enrollmentsCollection = await getCollection<Enrollment>('enrollments');
    const usersCollection = await getCollection('users');
    const classesCollection = await getCollection('classes');

    // Buscar inscripciones con estado 'enrolled' y con fecha de próximo pago establecida
    console.log(`[${new Date().toISOString()}] Iniciando proceso de recordatorios de pago`);
    const enrollments = await enrollmentsCollection.find({
      status: 'enrolled',
      nextPaymentDueDate: { $exists: true, $ne: null }
    }).toArray();
    
    console.log(`[${new Date().toISOString()}] Encontradas ${enrollments.length} inscripciones para procesar`);

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ message: 'No hay inscripciones que requieran recordatorios' }, { status: 200 });
    }

    // Obtener IDs únicos de estudiantes y clases
    const studentIds = [...new Set(enrollments.map(e => e.student_id))];
    const classIds = [...new Set(enrollments.map(e => e.class_id))];
    
    console.log(`[${new Date().toISOString()}] Procesando ${studentIds.length} estudiantes y ${classIds.length} clases únicas`);

    // Obtener todos los estudiantes y clases necesarios en dos consultas
    const [students, classes] = await Promise.all([
      usersCollection.find({ _id: { $in: studentIds.map(id => new ObjectId(id)) } }).toArray(),
      classesCollection.find({ _id: { $in: classIds.map(id => new ObjectId(id)) } }).toArray()
    ]);

    // Crear mapas para búsqueda rápida
    const studentMap = new Map(students.map(s => [s._id.toString(), s]));
    const classMap = new Map(classes.map(c => [c._id.toString(), c]));

    // Variables para rastrear el progreso
    let remindersSent = 0;
    let overdueNoticesSent = 0;
    let suspensionsApplied = 0;
    let notificationsSent = 0;
    let missingDataCount = 0;

    for (const enrollment of enrollments) {
      const nextPaymentDate = new Date(enrollment.nextPaymentDueDate!);
      const endOfDay = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth(), nextPaymentDate.getDate(), 23, 59, 59, 999);
      nextPaymentDate.setTime(endOfDay.getTime());

      // Obtener datos del estudiante y la clase desde los mapas
      const student = studentMap.get(enrollment.student_id?.toString() || '');
      const classData = classMap.get(enrollment.class_id?.toString() || '');

      if (!student || !classData) {
        missingDataCount++;
        continue;
      }

      // 1. Enviar recordatorio 7 días antes del vencimiento
      if (differenceInDays(nextPaymentDate, today) === 7) {
        try {
          // Enviar correo electrónico
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

          // Enviar notificación push
          await sendNotification({
            userId: [student._id.toString()],
            title: '💰 Recordatorio de pago',
            message: `Recuerda realizar el pago de ${classData.subjectName} ${getLevelName(classData.level)} antes del ${formatDateLong(nextPaymentDate)}`,
            link: `/student/enrollments/${enrollment._id.toString()}`,
            type: 'paymentReminder'
          });

          remindersSent++;
          notificationsSent++;
        } catch (emailError) {
          console.error(`Error enviando recordatorio a ${student.email} (7 días):`, emailError);
          // Continuar con el siguiente registro aunque falle el envío
        }
      }

      // 2. Enviar recordatorio 1 día antes del vencimiento
      else if (differenceInDays(nextPaymentDate, today) === 1) {
        try {
          // Enviar correo electrónico urgente
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

          // Enviar notificación push urgente
          await sendNotification({
            userId: [student._id.toString()],
            title: '⚠️ Pago pendiente',
            message: `¡Último día para realizar el pago de ${classData.subjectName} ${getLevelName(classData.level)}! Vence hoy.`,
            link: `/student/enrollments/${enrollment._id.toString()}`,
            type: 'paymentReminder'
          });

          remindersSent++;
          notificationsSent++;
        } catch (emailError) {
          console.error(`Error enviando recordatorio urgente a ${student.email} (1 día):`, emailError);
          // Continuar con el siguiente registro aunque falle el envío
        }
      }

      // 3. Enviar notificación de pago vencido si han pasado 5 días desde la fecha de vencimiento
      else if (isAfter(today, addDays(nextPaymentDate, 5))) {

        // Verificar si ya se ha marcado como vencido para no enviar múltiples correos
        const isAlreadyMarkedOverdue = enrollment.paymentsMade?.some(
          (payment: Payment) => payment.status === 'overdue' &&
            payment.date && isBefore(new Date(payment.date), today) &&
            differenceInDays(today, new Date(payment.date)) < 7
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
              // Enviar correo de pago vencido
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

              // Enviar notificación de pago vencido
              await sendNotification({
                userId: [student._id.toString()],
                title: '❌ Pago vencido',
                message: `El pago de ${classData.subjectName} ${getLevelName(classData.level)} está vencido. Tienes 7 días de gracia.`,
                link: `/student/enrollments/${enrollment._id.toString()}`,
                type: 'paymentOverdue'
              });

              overdueNoticesSent++;
              notificationsSent++;
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
      else if (isAfter(today, addDays(nextPaymentDate, 20))) {
        // Solo suspender si no está ya suspendido
        if (enrollment.status !== 'suspended_due_to_non_payment') {
          await enrollmentsCollection.updateOne(
            { _id: enrollment._id },
            { $set: { status: 'suspended_due_to_non_payment' } }
          );

          // Enviar notificación de suspensión
          await sendNotification({
            userId: [student._id.toString()],
            title: '⛔ Clase suspendida',
            message: `Tu acceso a ${classData.subjectName} ${getLevelName(classData.level)} ha sido suspendido por falta de pago.`,
            link: `/student/enrollments/${enrollment._id.toString()}`,
            type: 'paymentOverdue'
          });

          suspensionsApplied++;
          notificationsSent++;
          // Opcional: Enviar correo de suspensión
          // await sendAccountSuspendedEmail(...);
        }
      }
    }

    // Resumen final
    console.log(`[${new Date().toISOString()}] Proceso completado. Resumen:`);
    console.log(`- Recordatorios enviados: ${remindersSent}`);
    console.log(`- Avisos de vencimiento: ${overdueNoticesSent}`);
    console.log(`- Suspensiones aplicadas: ${suspensionsApplied}`);
    console.log(`- Notificaciones push: ${notificationsSent}`);
    
    return NextResponse.json({
      message: 'Proceso de recordatorios completado',
      remindersSent,
      overdueNoticesSent,
      suspensionsApplied,
      notificationsSent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorDetails = error instanceof Error ? error.stack : 'No hay detalles adicionales';
    
    console.error(`[${new Date().toISOString()}] Error en el proceso de recordatorios:`, errorMessage);
    console.error('Detalles del error:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
