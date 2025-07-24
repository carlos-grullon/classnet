import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId, Document } from 'mongodb';
import { differenceInDays } from 'date-fns';
import { sendTrialExpiredEmail, sendTrialExpiryNotificationEmail } from '@/utils/EmailService';

// Increase max listeners for the process to avoid memory leak warnings
if (process.listenerCount('beforeExit') >= 10) {
  process.setMaxListeners(15);
}

// Environment variables
const CRON_SECRET = process.env.CRON_SECRET;
const NOTIFY_DAYS_BEFORE_EXPIRY = [1, 3]; // Notify 1 and 3 days before expiry

// Types
interface Enrollment {
  _id: ObjectId;
  student_id: ObjectId;
  class_id: ObjectId;
  status: string;
  expiresAt?: Date;
  notificationSent?: boolean;
  [key: string]: any;
}

// GET /api/cron/daily-tasks - Process daily tasks including trial expirations
export async function GET(req: Request) {
  // 1. Security: Validate cron secret
  const authHeader = req.headers.get('authorization');
  const providedSecret = authHeader?.split(' ')[1];
  
  if (!providedSecret || providedSecret !== CRON_SECRET) {
    console.error('🚨 Unauthorized access attempt to daily-tasks endpoint');
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const now = new Date();
    console.log(`🔄 Starting daily tasks at ${now.toISOString()}`);

    // 2. Process expiring trials
    const result = await processExpiringTrials();
    
    console.log('✅ Daily tasks completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Tareas diarias completadas',
      stats: result,
      processedAt: now.toISOString()
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error en tareas diarias:', error);
    
    return NextResponse.json(
      { error: 'Error al procesar tareas diarias', details: message },
      { status: 500 }
    );
  }
}

async function processExpiringTrials() {
  const now = new Date();
  const enrollmentsCollection = await getCollection<Enrollment>('enrollments');

  // 1. Find all active trial enrollments
  const trialEnrollments = await enrollmentsCollection.find({
    status: 'trial',
    expiresAt: { $exists: true }
  }).toArray();

  if (trialEnrollments.length === 0) {
    console.log('ℹ️ No se encontraron inscripciones de prueba para procesar');
    return { processed: 0, expired: 0, notified: 0, errors: 0 };
  }

  console.log(`🔍 Encontradas ${trialEnrollments.length} inscripciones de prueba`);

  let expiredCount = 0;
  let notifiedCount = 0;
  let errorCount = 0;

  // 2. Process each trial enrollment
  for (const enrollment of trialEnrollments) {
    try {
      if (!enrollment.expiresAt) continue;

      const daysUntilExpiry = differenceInDays(new Date(enrollment.expiresAt), now);
      
      // A. Handle expired trials
      if (daysUntilExpiry < 0) {
        await handleExpiredTrial(enrollment);
        expiredCount++;
      } 
      // B. Send expiration notifications
      else if (NOTIFY_DAYS_BEFORE_EXPIRY.includes(daysUntilExpiry)) {
        await sendTrialExpiryNotification(enrollment, daysUntilExpiry);
        notifiedCount++;
      }
    } catch (error) {
      console.error(`❌ Error procesando inscripción ${enrollment._id}:`, error);
      errorCount++;
    }
  }

  return {
    total: trialEnrollments.length,
    expired: expiredCount,
    notified: notifiedCount,
    errors: errorCount
  };
}

async function handleExpiredTrial(enrollment: Enrollment) {
  const enrollmentsCollection = await getCollection<Enrollment>('enrollments');
  
  // Update enrollment status to expired
  await enrollmentsCollection.updateOne(
    { _id: enrollment._id },
    { 
      $set: { 
        status: 'pending_payment',
        updatedAt: new Date(),
        expiredAt: new Date()
      } 
    }
  );

  try {
    // Send expiration email
    const usersCollection = await getCollection<Document>('users');
    const classesCollection = await getCollection<Document>('classes');
    
    const [user, classData] = await Promise.all([
      usersCollection.findOne({ _id: enrollment.student_id }),
      classesCollection.findOne({ _id: enrollment.class_id })
    ]);

    if (user?.email && classData) {
      await sendTrialExpiredEmail(
        user.email,
        user.username || 'Estudiante',
        classData.subjectName,
        classData.level,
        enrollment.expiresAt || new Date()
      );
    }
  } catch (error) {
    console.error('❌ Error enviando correo de prueba expirada:', error);
    throw error; // Re-throw to be caught by the caller
  }
}

async function sendTrialExpiryNotification(enrollment: Enrollment, daysLeft: number) {
  try {
    const usersCollection = await getCollection<Document>('users');
    const classesCollection = await getCollection<Document>('classes');
    
    const [user, classData] = await Promise.all([
      usersCollection.findOne({ _id: enrollment.student_id }),
      classesCollection.findOne({ _id: enrollment.class_id })
    ]);

    if (!user?.email || !classData) {
      throw new Error('Usuario o clase no encontrados');
    }

    // Enviar notificación de vencimiento
    await sendTrialExpiryNotificationEmail(
      user.email,
      user.username || 'Estudiante',
      classData.subjectName,
      classData.level,
      enrollment.expiresAt || new Date(),
      daysLeft
    );

    // Mark notification as sent
    const enrollmentsCollection = await getCollection<Enrollment>('enrollments');
    await enrollmentsCollection.updateOne(
      { _id: enrollment._id },
      { 
        $set: { 
          lastNotificationSent: new Date(),
          [`notifications.${daysLeft}Days`]: {
            sent: true,
            sentAt: new Date()
          }
        } 
      }
    );
  } catch (error) {
    console.error(`❌ Error en notificación de prueba por expirar (ID: ${enrollment._id}):`, error);
    throw error;
  }
}