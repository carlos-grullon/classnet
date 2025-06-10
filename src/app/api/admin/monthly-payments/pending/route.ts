import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { formatDateLong } from '@/utils/GeneralTools';

interface ClassInfo {
  _id: string;
  name: string;
  level?: string;
  teacher_id?: string;
  teacherName?: string;
}

// GET /api/admin/monthly-payments/pending - Obtener todos los pagos mensuales pendientes
export async function GET(req: NextRequest) {
  try {
    // Obtener colecciones
    const enrollmentsCollection = await getCollection('enrollments');
    const classesCollection = await getCollection('classes');
    const usersCollection = await getCollection('users');
    
    // Buscar inscripciones con pagos pendientes
    const enrollments = await enrollmentsCollection.find({
      'paymentsMade.status': 'pending'
    }).toArray();
    
    // Preparar datos para la respuesta
    const pendingPayments = [];
    const allClasses = [];
    
    for (const enrollment of enrollments) {
      // Filtrar solo los pagos pendientes
      const pendingPaymentsForEnrollment = enrollment.paymentsMade?.filter(
        (payment: any) => payment.status === 'pending'
      ) || [];
      
      if (pendingPaymentsForEnrollment.length > 0) {
        // Obtener información de la clase
        const classData = await classesCollection.findOne({ _id: enrollment.class_id });
        allClasses.push(classData);

        // Obtener información del estudiante
        const student = await usersCollection.findOne({ _id: enrollment.student_id });
        
        if (!student || !classData) {
          throw new Error('Falta info del estudiante o la clase');
        }
        // Agregar información a la lista de pagos pendientes
        for (const payment of pendingPaymentsForEnrollment) {
          
          pendingPayments.push({
            paymentId: payment._id,
            enrollmentId: enrollment._id.toString(),
            classId: enrollment.class_id.toString(),
            studentName: student.username,
            studentEmail: student.email,
            className: classData.subjectName,
            classLevel: classData.level,
            amount: payment.amount,
            currency: classData.currency || 'DOP',
            paymentDate: payment.date,
            paymentDueDate: formatDateLong(enrollment.nextPaymentDueDate),
            proofUrl: payment.proofUrl,
            notes: payment.notes || '',
            submittedAt: payment.submittedAt
          });
        }
      }
    }

    // Preparar información de clases
    const classes: ClassInfo[] = await Promise.all(
      allClasses.map(async (classData: any) => {
        
        return {
          _id: classData._id.toString(),
          name: classData.subjectName || 'Clase sin nombre',
          level: classData.level || '',
          teacher_id: classData.teacher_id?.toString(),
          teacherName: classData.teacherName || ''
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      pendingPayments,
      classes
    });
  } catch (error: any) {
    console.error('Error al obtener pagos mensuales pendientes:', error);
    return NextResponse.json({ 
      error: 'Error al procesar la solicitud',
      details: error.message
    }, { status: 500 });
  }
}
