import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import path from 'path';
import { unlink } from 'fs/promises';

// PATCH /api/admin/enrollments/[id]/status - Actualizar estado de inscripción
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const enrollmentId = params.id;
    
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
    const validStatuses = ['pending_payment', 'proof_submitted', 'enrolled', 'proof_rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
    }
    
    // Obtener datos del estudiante para el correo
    const usersCollection = await getCollection('users');
    const student = await usersCollection.findOne({ _id: new ObjectId(enrollment.student_id) });
    
    // Obtener datos de la clase para el correo
    const classesCollection = await getCollection('classes');
    const classData = await classesCollection.findOne({ _id: new ObjectId(enrollment.class_id) });
    
    // Si se está aprobando el pago (cambiando a 'enrolled')
    if (status === 'enrolled' && enrollment.status === 'proof_submitted') {
      // Enviar correo de confirmación de pago
      await sendEnrollmentConfirmationEmail(student, classData, enrollment);
      
      // Eliminar el archivo de comprobante de pago (ya no es necesario)
      if (enrollment.paymentProof && enrollment.paymentProof.startsWith('/uploads/payment-proofs/')) {
        try {
          const filePath = path.join(process.cwd(), 'public', enrollment.paymentProof);
          await unlink(filePath);
          console.log(`Archivo eliminado: ${filePath}`);
        } catch (error) {
          console.error('Error al eliminar archivo de comprobante:', error);
          // No interrumpimos el flujo si hay error al eliminar
        }
      }
    }
    
    // Si se está rechazando el comprobante
    if (status === 'proof_rejected' && enrollment.status === 'proof_submitted') {
      // Enviar correo de rechazo de comprobante
      await sendPaymentRejectionEmail(student, classData, enrollment, notes);
    }
    
    // Actualizar inscripción
    await enrollmentsCollection.updateOne(
      { _id: new ObjectId(enrollmentId) },
      { 
        $set: { 
          status: status, 
          ...(notes ? { notes: notes } : {}),
          updatedAt: new Date(),
          // Si se aprueba el pago, eliminar la referencia al comprobante
          ...(status === 'enrolled' ? { paymentProof: null } : {})
        } 
      }
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
    
  } catch (error: any) {
    console.error('Error al actualizar estado de inscripción:', error);
    return NextResponse.json({ 
      error: 'Error al procesar la solicitud',
      details: error.message
    }, { status: 500 });
  }
}

// Función para enviar correo de confirmación de inscripción
async function sendEnrollmentConfirmationEmail(student: any, classData: any, enrollment: any) {
  // Aquí implementarías el envío de correo real
  // Por ahora solo registramos en consola
  console.log('Enviando correo de confirmación de inscripción a:', student.email);
  console.log('Asunto: ¡Inscripción Confirmada! - ClassNet');
  console.log(`Contenido: Hola ${student.name}, tu inscripción a la clase ${classData.name} ha sido confirmada.`);
  
  // En una implementación real, usarías un servicio como SendGrid, Mailgun, etc.
  // Ejemplo con SendGrid (requeriría instalar @sendgrid/mail):
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: student.email,
    from: 'noreply@classnet.com',
    subject: '¡Inscripción Confirmada! - ClassNet',
    text: `Hola ${student.name}, tu inscripción a la clase ${classData.name} ha sido confirmada.`,
    html: `<p>Hola <strong>${student.name}</strong>,</p><p>Tu inscripción a la clase <strong>${classData.name}</strong> ha sido confirmada.</p>`,
  };
  
  await sgMail.send(msg);
  */
}

// Función para enviar correo de rechazo de comprobante
async function sendPaymentRejectionEmail(student: any, classData: any, enrollment: any, notes: string) {
  // Aquí implementarías el envío de correo real
  // Por ahora solo registramos en consola
  console.log('Enviando correo de rechazo de comprobante a:', student.email);
  console.log('Asunto: Acción Requerida: Comprobante de Pago Rechazado - ClassNet');
  console.log(`Contenido: Hola ${student.name}, tu comprobante de pago para la clase ${classData.name} ha sido rechazado.`);
  console.log(`Motivo: ${notes || 'No se especificó un motivo'}`);
  
  // En una implementación real, usarías un servicio como SendGrid, Mailgun, etc.
  // Similar al ejemplo anterior
}