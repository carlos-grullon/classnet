import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';

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
    
    // Obtener todas las clases disponibles
    const allClasses = await classesCollection.find({}).toArray();
    
    // Preparar información de clases
    const classes: ClassInfo[] = await Promise.all(
      allClasses.map(async (classData: any) => {
        // Obtener información del profesor si está disponible
        let teacherName = '';
        if (classData.teacher_id) {
          const usersCollection = await getCollection('users');
          const teacher = await usersCollection.findOne({ _id: classData.teacher_id });
          if (teacher) {
            teacherName = `${teacher.firstName} ${teacher.lastName}`;
          }
        }
        
        return {
          _id: classData._id.toString(),
          name: classData.name || 'Clase sin nombre',
          level: classData.level || '',
          teacher_id: classData.teacher_id?.toString(),
          teacherName
        };
      })
    );
    
    // Buscar inscripciones con pagos pendientes
    const enrollments = await enrollmentsCollection.find({
      'paymentsMade.status': 'pending'
    }).toArray();
    
    // Preparar datos para la respuesta
    const pendingPayments = [];
    
    for (const enrollment of enrollments) {
      // Filtrar solo los pagos pendientes
      const pendingPaymentsForEnrollment = enrollment.paymentsMade?.filter(
        (payment: any) => payment.status === 'pending'
      ) || [];
      
      if (pendingPaymentsForEnrollment.length > 0) {
        // Obtener información de la clase
        const classData = await classesCollection.findOne({ _id: enrollment.class_id });
        
        // Obtener información del estudiante
        const usersCollection = await getCollection('users');
        const student = await usersCollection.findOne({ _id: enrollment.student_id });
        
        // Agregar información a la lista de pagos pendientes
        for (const payment of pendingPaymentsForEnrollment) {
          // Preparar nombre del estudiante con validación
          let studentName = 'Estudiante';
          if (student && student.firstName && student.lastName) {
            studentName = `${student.firstName} ${student.lastName}`;
          } else if (student && student.firstName) {
            studentName = student.firstName;
          } else if (student && student.lastName) {
            studentName = student.lastName;
          }
          
          pendingPayments.push({
            paymentId: payment._id,
            enrollmentId: enrollment._id.toString(),
            classId: enrollment.class_id.toString(),
            studentName,
            studentEmail: student?.email || '',
            className: classData?.name || 'Clase',
            classLevel: classData?.level || '',
            amount: payment.amount,
            currency: classData?.currency || 'DOP',
            date: payment.date,
            proofUrl: payment.proofUrl,
            notes: payment.notes || '',
            submittedAt: payment.submittedAt
          });
        }
      }
    }
    
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
