import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import path from 'path';
import { unlink } from 'fs/promises';
import { mongoTimeToTimeString12h } from '@/utils/Tools.ts';
import { sendEnrollmentConfirmationEmail, sendPaymentRejectionEmail } from '@/utils/EmailService';

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
const getLevel = (level: string): string => {
  switch(level) {
    case '1': return 'Principiante';
    case '2': return 'Intermedio';
    case '3': return 'Avanzado';
    default: return level;
  }
};
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
      await sendConfirmationEmailToStudent(student, classData);
      
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
      await sendRejectionEmailToStudent(student, classData, notes);
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
async function sendConfirmationEmailToStudent(student: any, classData: any) {
  try {
    // Usar el nuevo servicio de correo electrónico
    await sendEnrollmentConfirmationEmail(
      student.email,
      student.name || student.username || 'Estudiante',
      classData.name || classData.subjectName || 'la clase',
      getLevel(classData.level),
      {
        teacherName: classData.teacherName,
        schedule: `${getDayName(classData.selectedDays)} ${mongoTimeToTimeString12h(classData.startTime)} - ${mongoTimeToTimeString12h(classData.endTime)}`,
        startDate: classData.startDate ? new Date(classData.startDate).toLocaleDateString() : undefined,
        price: classData.price
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
async function sendRejectionEmailToStudent(student: any, classData: any, notes: string) {
  try {
    // Usar el nuevo servicio de correo electrónico
    await sendPaymentRejectionEmail(
      student.email,
      student.name || student.username || 'Estudiante',
      classData.name || classData.subjectName || 'la clase',
      getLevel(classData.level),
      notes || 'El comprobante no cumple con los requisitos necesarios.'
    );
    console.log(`Correo de rechazo enviado a ${student.email}`);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de rechazo:', error);
    return false;
  }
}