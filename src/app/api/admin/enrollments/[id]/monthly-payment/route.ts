import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import { sendPaymentConfirmationEmail, sendPaymentRejectionEmail } from '@/utils/EmailService';
import { unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { addMonths } from 'date-fns';
import { formatDateLong } from '@/utils/GeneralTools';
import { Payment, EnrollmentUpdate } from '@/interfaces/Enrollment';

// Función auxiliar para eliminar archivo de comprobante de pago
async function deletePaymentProofFile(proofUrl: string) {
  try {
    if (!proofUrl) return;

    // Convertir la URL relativa a ruta absoluta del sistema de archivos
    const filePath = path.join(process.cwd(), 'public', proofUrl);

    // Verificar si el archivo existe antes de intentar eliminarlo
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
      console.log(`Archivo eliminado: ${filePath}`);
    } else {
      console.log(`El archivo no existe: ${filePath}`);
    }
  } catch (error) {
    console.error('Error al eliminar archivo de comprobante:', error);
  }
}

// GET /api/admin/enrollments/[id]/monthly-payment - Obtener pagos mensuales de una inscripción
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const enrollmentId = params.id;

    // Obtener colección
    const enrollmentsCollection = await getCollection('enrollments');

    // Verificar si la inscripción existe
    const enrollment = await enrollmentsCollection.findOne({
      _id: new ObjectId(enrollmentId)
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 });
    }

    // Obtener información de la clase
    const classesCollection = await getCollection('classes');
    const classData = await classesCollection.findOne({ _id: enrollment.class_id });

    // Obtener información del estudiante
    const usersCollection = await getCollection('users');
    const student = await usersCollection.findOne({ _id: enrollment.student_id });

    // Preparar respuesta con información de pagos
    const paymentInfo = {
      enrollmentId: enrollment._id.toString(),
      className: classData?.name || 'Clase',
      classLevel: classData?.level || '',
      studentName: student ? `${student.firstName} ${student.lastName}` : 'Estudiante',
      studentEmail: student?.email || '',
      monthlyAmount: enrollment.monthlyPaymentAmount || enrollment.paymentAmount,
      currency: classData?.currency || 'DOP',
      nextPaymentDueDate: enrollment.nextPaymentDueDate,
      lastPaymentDate: enrollment.lastPaymentDate,
      paymentsMade: enrollment.paymentsMade || [],
      status: enrollment.status
    };

    return NextResponse.json(paymentInfo);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al obtener pagos mensuales:', error);
    return NextResponse.json({
      error: 'Error al procesar la solicitud',
      details: message
    }, { status: 500 });
  }
}

// PATCH /api/admin/enrollments/[id]/monthly-payment - Actualizar estado de un pago mensual
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const enrollmentId = params.id;

    // Obtener colección
    const enrollmentsCollection = await getCollection('enrollments');

    // Verificar si la inscripción existe
    const enrollment = await enrollmentsCollection.findOne({
      _id: new ObjectId(enrollmentId)
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 });
    }

    // Obtener datos del estudiante y la clase
    const usersCollection = await getCollection('users');
    const student = await usersCollection.findOne({ _id: enrollment.student_id });
    const classesCollection = await getCollection('classes');
    const classData = await classesCollection.findOne({ _id: enrollment.class_id });

    const body = await req.json();
    const { paymentId, status, notes } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pago requerido' }, { status: 400 });
    }

    // Validar estado
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
    }

    // Buscar el pago específico en el array de pagos
    const paymentIndex = enrollment.paymentsMade?.findIndex(
      (payment: Payment) => payment._id!.toString() === paymentId
    );

    if (paymentIndex === -1 || paymentIndex === undefined) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    }

    // Guardar la URL del comprobante para eliminarlo después
    const proofUrl = enrollment.paymentsMade[paymentIndex].proofUrl;

    // Preparar la actualización según el estado
    const updateData: EnrollmentUpdate = {
      paymentsMade: {
        [paymentIndex]: {
          status: status === 'approved' ? 'paid' : 
                 status === 'rejected' ? 'rejected' : 'pending',
          ...(status === 'approved' && { approvedAt: new Date() }),
          ...(status === 'rejected' && { rejectedAt: new Date() }),
          adminNotes: notes || ''
        }
      },
      ...(status === 'approved' && {
        lastPaymentDate: enrollment.paymentsMade[paymentIndex].date,
        nextPaymentDueDate: addMonths(enrollment.nextPaymentDueDate, 1)
      })
    };

    // Enviar correo de confirmación de pago
    if (status === 'approved') {
      try {
        // Verificar que tenemos la información del estudiante antes de enviar el correo
        if (student && student.email && student.username) {
          console.log(`Enviando correo de confirmación a: ${student.email} (${student.username})`);
          
          await sendPaymentConfirmationEmail(
            student.email, // Usar directamente student.email sin optional chaining
            student.username, // Usar directamente student.username sin optional chaining
            classData?.subjectName || 'que te inscribiste',
            classData?.level || '',
            {
              paymentDate: formatDateLong(new Date()),
              paymentDueDate: formatDateLong(enrollment.nextPaymentDueDate),
              nextPaymentDate: formatDateLong(addMonths(enrollment.nextPaymentDueDate, 1)),
              amount: enrollment.paymentsMade[paymentIndex].amount,
              currency: classData?.currency || 'RD$'
            }
          );
        }
      } catch (emailError) {
        console.error('Error al enviar correo de confirmación:', emailError);
      }
    } else if (status === 'rejected') {
      try {
        await sendPaymentRejectionEmail(
          student?.email,
          student?.username,
          classData?.subjectName || 'que te inscribiste',
          classData?.level || '',
          notes || 'No se proporcionó una razón específica'
        );
      } catch (emailError) {
        console.error('Error al enviar correo de rechazo:', emailError);
      }
    }

    // Actualizar en la base de datos
    await enrollmentsCollection.updateOne(
      { _id: new ObjectId(enrollmentId) },
      { $set: updateData }
    );

    // Eliminar el archivo de comprobante si el pago fue aprobado
    if (status === 'approved') {
      await deletePaymentProofFile(proofUrl);
    }

    return NextResponse.json({
      success: true,
      message: `Pago mensual ${status === 'approved' ? 'aprobado' : status === 'rejected' ? 'rechazado' : 'actualizado'} correctamente`,
      paymentId,
      status
    });

  } catch (error) {
    console.error('Error al actualizar pago mensual:', error);
    return NextResponse.json({
      error: 'Error al procesar la solicitud',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET /api/admin/enrollments/[id]/monthly-payment/all - Obtener todos los pagos mensuales pendientes
export async function getMonthlyPaymentsPending() {
  try {
    // Obtener colección
    const enrollmentsCollection = await getCollection('enrollments');

    // Buscar inscripciones con pagos pendientes
    const enrollments = await enrollmentsCollection.find({
      'paymentsMade.status': 'pending'
    }).toArray();

    // Preparar datos para la respuesta
    const pendingPayments = [];

    for (const enrollment of enrollments) {
      // Filtrar solo los pagos pendientes
      const pendingPaymentsForEnrollment = enrollment.paymentsMade?.filter(
        (payment: Payment) => payment.status === 'pending'
      ) || [];

      if (pendingPaymentsForEnrollment.length > 0) {
        // Obtener información de la clase
        const classesCollection = await getCollection('classes');
        const classData = await classesCollection.findOne({ _id: enrollment.class_id });

        // Obtener información del estudiante
        const usersCollection = await getCollection('users');
        const student = await usersCollection.findOne({ _id: enrollment.student_id });

        // Agregar información a la lista de pagos pendientes
        for (const payment of pendingPaymentsForEnrollment) {
          pendingPayments.push({
            paymentId: payment._id,
            enrollmentId: enrollment._id,
            studentName: student ? `${student.firstName} ${student.lastName}` : 'Estudiante',
            studentEmail: student?.email || '',
            className: classData?.name || 'Clase',
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

    return pendingPayments;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al obtener pagos mensuales pendientes:', error);
    return NextResponse.json({
      error: 'Error al procesar la solicitud',
      details: message
    }, { status: 500 });
  }
}
