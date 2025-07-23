import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import { mongoTimeToTimeString12h } from '@/utils/GeneralTools.ts';
import { formatDateLong } from '@/utils/GeneralTools.ts';
import { sendEnrollmentConfirmationEmail, sendPaymentRejectionEmail } from '@/utils/EmailService';
import { addMonths } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Enrollment } from '@/interfaces/Enrollment';
import { User } from '@/interfaces/User';
import { ClassDatabase } from '@/interfaces/Class';

const getDayName = (days: string[]): string => {
  const daysMap = {
    '1': 'Lunes',
    '2': 'Martes',
    '3': 'Miércoles',
    '4': 'Jueves',
    '5': 'Viernes',
    '6': 'Sábados',
    '7': 'Domingos'
  };
  
  return days.map(day => daysMap[day as keyof typeof daysMap]).join(', ');
};

// PATCH /api/admin/enrollments/[id]/status - Actualizar estado de inscripción
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const enrollmentId = (await params).id;
    
    // Obtener colección
    const enrollmentsCollection = await getCollection('enrollments');
    
    // Verificar si la inscripción existe
    const enrollment = await enrollmentsCollection.findOne({ _id: new ObjectId(enrollmentId) });
    
    if (!enrollment) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 });
    }
    
    const body = await req.json();
    const { status, notes } = body;
    
    // Validar estado
    const validStatuses = ['pending_payment', 'proof_submitted', 'enrolled', 'proof_rejected', 'cancelled', 'trial'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
    }

    // Obtener datos del estudiante para el correo
    const usersCollection = await getCollection('users');
    const student = await usersCollection.findOne<User>({ _id: new ObjectId(enrollment.student_id) });
    
    // Obtener datos de la clase para el correo
    const classesCollection = await getCollection('classes');
    const classData = await classesCollection.findOne<ClassDatabase>({ _id: new ObjectId(enrollment.class_id) });
    
    // Si se está aprobando el pago (cambiando a 'enrolled')
    if (status === 'enrolled' && enrollment.status === 'proof_submitted') {
      // Enviar correo de confirmación de pago
      await sendConfirmationEmailToStudent(student!, classData!);
    }
    
    // Si se está rechazando el comprobante
    if (status === 'proof_rejected' && enrollment.status === 'proof_submitted') {
      // Enviar correo de rechazo de comprobante
      await sendRejectionEmailToStudent(student!, classData!, notes);
    }
    
    // Preparar datos de actualización
    const updateData: Enrollment = { 
      status, 
      updatedAt: new Date()
    };
    
    // Agregar notas si existen
    if (notes) updateData.notes = notes;
    
    // Si se aprueba el pago y la clase está en progreso, configurar datos de facturación
    if (status === 'enrolled' && classData?.status === 'in_progress') {
      const now = new Date();
      updateData.billingStartDate = now;
      updateData.nextPaymentDueDate = addMonths(now, 1);
      updateData.priceAtEnrollment = classData.price;
      updateData.lastPaymentDate = now;
      updateData.paymentsMade = [{
        _id: uuidv4(),
        amount: classData.price,
        date: now,
        status: 'paid',
        notes: 'Pago inicial de inscripción',
        paymentDueDate: now
      }];
    }
    
    // Si se rechaza el comprobante, asegurarse de que no tenga datos de facturación
    if (status === 'proof_rejected') {
      // Eliminar cualquier dato de facturación si existiera
      updateData.billingStartDate = null;
      updateData.nextPaymentDueDate = null;
      updateData.lastPaymentDate = null;
      // Mantener el comprobante para que el estudiante pueda ver qué fue rechazado
    }
    
    // Actualizar inscripción
    await enrollmentsCollection.updateOne(
      { _id: new ObjectId(enrollmentId) },
      { $set: updateData }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Estado de inscripción actualizado correctamente',
      enrollment: {
        id: enrollment._id,
        status: enrollment.status,
        updatedAt: enrollment.updatedAt,
        notes: enrollment.notes
      }
    });
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al actualizar estado de inscripción:', error);
    return NextResponse.json({ 
      error: 'Error al procesar la solicitud',
      details: message
    }, { status: 500 });
  }
}

// Función para enviar correo de confirmación de inscripción
async function sendConfirmationEmailToStudent(student: User, classData: ClassDatabase) {
  try {
    await sendEnrollmentConfirmationEmail(
      student.email || '{ email del estudiante }',
      student.username || '{ nombre del estudiante }',
      classData.subjectName || '{ nombre de la clase }',
      classData.level,
      {
        teacherName: classData.teacherName || '{ nombre del profesor }',
        schedule: `${getDayName(classData.selectedDays || [])} ${mongoTimeToTimeString12h(classData.startTime)} - ${mongoTimeToTimeString12h(classData.endTime)}`,
        startDate: classData.startDate ? formatDateLong(new Date(classData.startDate)) : undefined,
        price: classData.price,
        whatsappLink: classData.whatsappLink || undefined
      }
    );
    console.log(`Correo de confirmación enviado a ${student.email}`);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de confirmación:', error);
    return false;
  }
}

// Función para enviar correo de rechazo de comprobante
async function sendRejectionEmailToStudent(student: User, classData: ClassDatabase, notes: string) {
  try {
    await sendPaymentRejectionEmail(
      student.email || '{ email del estudiante }',
      student.username || '{ nombre del estudiante }',
      classData.subjectName || '{ nombre de la clase }',
      classData.level,
      notes || 'El comprobante no cumple con los requisitos necesarios.'
    );
    console.log(`Correo de rechazo enviado a ${student.email}`);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de rechazo:', error);
    return false;
  }
}