import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import { sendPaymentConfirmationEmail, sendPaymentRejectionEmail } from '@/utils/EmailService';
import { addMonths } from 'date-fns';
import { formatDateLong } from '@/utils/GeneralTools';
import { Payment } from '@/interfaces/Enrollment';

// GET /api/admin/enrollments/[id]/monthly-payment - Obtener información de pagos mensuales
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const enrollmentId = (await params).id;

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const enrollmentId = (await params).id;

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

    const body = await request.json();
    const { paymentId, status, notes } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pago requerido' }, { status: 400 });
    }

    // Validar estado
    const validStatuses = ['pending', 'approved', 'rejected', 'overdue'];
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

    // Actualizar en la base de datos
    await enrollmentsCollection.updateOne(
      { _id: new ObjectId(enrollmentId), 'paymentsMade._id': paymentId },
      {
        $set: {
          'paymentsMade.$.status': status === 'approved' ? 'paid' : status,
          'paymentsMade.$.adminNotes': notes,
          'paymentsMade.$.processedAt': new Date(),
          'paymentsMade.$.paymentDueDate': enrollment.nextPaymentDueDate,
          ...(status === 'approved' && { 
            lastPaymentDate: enrollment.paymentsMade[paymentIndex].date,
            nextPaymentDueDate: addMonths(enrollment.nextPaymentDueDate, 1)
          }),
          status: status === 'approved' && 'enrolled'
        }
      }
    );

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
