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
      return NextResponse.json({ error: 'No se encontraron inscripciones' }, { status: 404 });
    }

    let remindersSent = 0;
    let overdueNoticesSent = 0;

    for (const enrollment of enrollments) {
      const nextPaymentDate = new Date(enrollment.nextPaymentDueDate!);
      
      // Obtener datos del estudiante y la clase
      const student = await usersCollection.findOne({ _id: new ObjectId(enrollment.student_id) });
      const classData = await classesCollection.findOne({ _id: new ObjectId(enrollment.class_id) });
      
      if (!student || !classData) continue;

      // 1. Enviar recordatorio 7 días antes del vencimiento
      if (differenceInDays(nextPaymentDate, now) === 7) {
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
      }
      
      // 2. Enviar recordatorio 1 día antes del vencimiento
      else if (differenceInDays(nextPaymentDate, now) === 1) {
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
          // Marcar el pago como vencido
          const newPayment: Payment = {
            _id: new ObjectId().toString(),
            amount: enrollment.priceAtEnrollment || classData.price,
            date: now.toISOString(),
            status: 'overdue',
            notes: 'Pago mensual vencido'
          };
          
          // Usar aserción de tipo para evitar problemas con TypeScript
          await enrollmentsCollection.updateOne(
            { _id: enrollment._id },
            { $push: { paymentsMade: newPayment } }
          );

          // Enviar correo de notificación de pago vencido
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
      success: true,
      remindersSent,
      overdueNoticesSent,
      processedAt: now.toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al procesar recordatorios de pago:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
