import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { getUserId } from '@/utils/Tools.ts';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3, deleteS3Object } from '@/utils/S3Service';
import { Enrollment } from '@/interfaces/Enrollment';

// POST /api/student/enrollments/[id]/payment-proof - Subir comprobante de pago
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const enrollmentId = id;
    
    const studentId = await getUserId(req);
    // Obtener colección
    const enrollmentsCollection = await getCollection<Enrollment>('enrollments');
    
    // Verificar si la inscripción existe y pertenece al estudiante
    const enrollment = await enrollmentsCollection.findOne({
      _id: new ObjectId(enrollmentId),
      student_id: new ObjectId(studentId)
    });
    
    if (!enrollment) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 });
    }
    
    // Procesar el formulario multipart
    const formData = await req.formData();
    const paymentProof = formData.get('paymentProof') as File;
    const notes = formData.get('notes') as string || '';
    const paymentType = formData.get('paymentType') as string || 'enrollment'; // 'enrollment' o 'monthly'
    const paymentId = formData.get('paymentId') as string || ''; // ID del pago a actualizar (si existe)
    
    if (!paymentProof) {
      return NextResponse.json({ error: 'Comprobante de pago requerido' }, { status: 400 });
    }
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(paymentProof.type)) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF) o PDF' 
      }, { status: 400 });
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (paymentProof.size > maxSize) {
      return NextResponse.json({ 
        error: 'El archivo es demasiado grande. El tamaño máximo es 5MB' 
      }, { status: 400 });
    }
    
    // Subir a S3
    const fileUrl = await uploadToS3(paymentProof, 'enrollments');
    
    // Lógica diferente según el tipo de pago
    if (paymentType === 'enrollment') {
      // Verificar que la inscripción esté en estado pendiente de pago o con comprobante enviado
      if (enrollment.status !== 'pending_payment' && enrollment.status !== 'proof_submitted' && enrollment.status !== 'proof_rejected') {
        return NextResponse.json({ 
          error: 'La inscripción no está en un estado válido para enviar comprobante',
          status: enrollment.status
        }, { status: 400 });
      }
      
      // Si ya existe un comprobante anterior, intentar eliminarlo
      if ((enrollment.status === 'proof_submitted' || enrollment.status === 'proof_rejected') && enrollment.paymentProof) {
        await deleteS3Object(enrollment.paymentProof);
      }

      // Actualizar inscripción con comprobante de pago
      await enrollmentsCollection.updateOne(
        { _id: new ObjectId(enrollmentId) },
        { 
          $set: { 
            paymentProof: fileUrl,
            paymentNotes: notes,
            status: 'proof_submitted',
            paymentSubmittedAt: new Date(),
            updatedAt: new Date() 
          } 
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Comprobante de pago de inscripción enviado correctamente',
        fileUrl: fileUrl,
        enrollment: {
          id: enrollment._id,
          status: 'proof_submitted',
          updatedAt: new Date()
        }
      });
    } else {
      // Pago mensual
      // Verificar que la inscripción esté activa
      if (!['enrolled', 'proof_submitted', 'proof_rejected'].includes(enrollment.status!)) {
        return NextResponse.json({ 
          error: 'La inscripción no está en un estado válido para pagos mensuales',
          status: enrollment.status
        }, { status: 400 });
      }

      const now = new Date();
      
      // Verificar si estamos actualizando un pago existente o creando uno nuevo
      if (paymentId) {
        // Buscar el pago existente para obtener la URL del comprobante anterior
        const existingPayment = await enrollmentsCollection.findOne(
          { 
            _id: new ObjectId(enrollmentId),
            'paymentsMade._id': paymentId 
          },
          { projection: { 'paymentsMade.$': 1 } }
        );
        
        // Si encontramos el pago y tiene un comprobante, intentamos eliminarlo
        if (existingPayment && 
            existingPayment.paymentsMade && 
            existingPayment.paymentsMade[0] && 
            existingPayment.paymentsMade[0].proofUrl) {
          
          await deleteS3Object(existingPayment.paymentsMade[0].proofUrl);
        }
        
        // Actualizar el registro con la nueva URL del comprobante
        await enrollmentsCollection.updateOne(
          { 
            _id: new ObjectId(enrollmentId),
            'paymentsMade._id': paymentId 
          },
          { 
            $set: {
              'paymentsMade.$.proofUrl': fileUrl,
              'paymentsMade.$.notes': notes,
              'paymentsMade.$.status': 'pending',
              'paymentsMade.$.adminNotes': '',
              'paymentsMade.$.updatedAt': now
            }
          }
        );

        return NextResponse.json({ 
          success: true, 
          message: 'Comprobante de pago actualizado correctamente. Un administrador lo revisará pronto.',
          fileUrl: fileUrl,
          paymentId: paymentId
        });
      } else {
        // Crear un nuevo registro de pago mensual con ID único
        const newPaymentId = uuidv4(); // Generar ID único con UUID
        
        await enrollmentsCollection.updateOne(
          { _id: new ObjectId(enrollmentId) },
          { 
            $push: {
              paymentsMade: {
                _id: newPaymentId,
                amount: enrollment.paymentAmount || enrollment.priceAtEnrollment,
                date: now,
                proofUrl: fileUrl,
                status: 'pending',
                notes: notes,
                submittedAt: now
              }
            }
          }
        );

        return NextResponse.json({ 
          success: true, 
          message: 'Comprobante de pago mensual subido correctamente. Un administrador lo revisará pronto.',
          fileUrl: fileUrl,
          paymentId: newPaymentId
        });
      }
    }
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al subir comprobante de pago';
    console.error(message, error);
    return NextResponse.json({ 
      error: message,
      details: message
    }, { status: 500 });
  }
}

// GET /api/student/enrollments/[id]/payment-proof - Obtener comprobantes de pago
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Obtener el ID de la inscripción
    const enrollmentId = (await params).id;

    // Verificar autenticación y obtener ID del usuario
    const userId = await getUserId(req);
    
    if (!ObjectId.isValid(enrollmentId)) {
      return NextResponse.json({ error: 'ID de inscripción inválido' }, { status: 400 });
    }

    // Obtener la inscripción
    const enrollmentsCollection = await getCollection('enrollments');
    const enrollment = await enrollmentsCollection.findOne({ 
      _id: new ObjectId(enrollmentId),
      student_id: new ObjectId(userId)
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 });
    }

    // Verificar que el estudiante sea el dueño de la inscripción
    if (enrollment.student_id.toString() !== userId) {
      return NextResponse.json({ error: 'No autorizado para esta inscripción' }, { status: 403 });
    }

    // Obtener información de la clase
    const classesCollection = await getCollection('classes');
    const classData = await classesCollection.findOne({ _id: enrollment.class_id });

    // Preparar respuesta con información de pagos
    const paymentInfo = {
      enrollmentId: enrollment._id.toString(),
      className: classData?.subjectName || 'Clase',
      classLevel: classData?.level || '',
      monthlyAmount: enrollment.priceAtEnrollment || classData?.price,
      currency: classData?.currency || 'DOP',
      nextPaymentDueDate: enrollment.nextPaymentDueDate,
      lastPaymentDate: enrollment.lastPaymentDate,
      paymentsMade: enrollment.paymentsMade || [],
      status: enrollment.status
    };

    return NextResponse.json(paymentInfo);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener información de pago mensual';
    console.error(message, error);
    return NextResponse.json({ error: message, details: message }, { status: 500 });
  }
}
