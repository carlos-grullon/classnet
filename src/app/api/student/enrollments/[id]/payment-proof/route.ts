import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { getUserId } from '@/utils/Tools.ts';
import { ObjectId } from 'mongodb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Directorio para guardar los comprobantes de pago
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'payments');

// POST /api/student/enrollments/[id]/payment-proof - Subir comprobante de pago
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = await getUserId(req);
    const enrollmentId = params.id;
    
    // Obtener colección
    const enrollmentsCollection = await getCollection('enrollments');
    
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
    
    // Crear directorio si no existe
    await mkdir(UPLOADS_DIR, { recursive: true });

    // Generar nombre único para el archivo
    const fileExtension = paymentProof.name.split('.').pop();
    const fileName = `${paymentType}_${enrollmentId}_${Date.now()}.${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    // Guardar el archivo
    const fileBuffer = await paymentProof.arrayBuffer();
    await writeFile(filePath, Buffer.from(fileBuffer));
    
    // Ruta relativa para guardar en la base de datos
    const relativePath = `/uploads/payments/${fileName}`;
    
    // Lógica diferente según el tipo de pago
    if (paymentType === 'enrollment') {
      // Verificar que la inscripción esté en estado pendiente de pago
      if (enrollment.status !== 'pending_payment') {
        return NextResponse.json({ 
          error: 'La inscripción no está en estado pendiente de pago',
          status: enrollment.status
        }, { status: 400 });
      }

      // Actualizar inscripción con comprobante de pago
      await enrollmentsCollection.updateOne(
        { _id: new ObjectId(enrollmentId) },
        { 
          $set: { 
            paymentProof: relativePath,
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
        fileUrl: relativePath,
        enrollment: {
          id: enrollment._id,
          status: 'proof_submitted',
          updatedAt: new Date()
        }
      });
    } else {
      // Pago mensual
      // Verificar que la inscripción esté activa
      if (!['enrolled', 'proof_submitted', 'proof_rejected'].includes(enrollment.status)) {
        return NextResponse.json({ 
          error: 'La inscripción no está en un estado válido para pagos mensuales',
          status: enrollment.status
        }, { status: 400 });
      }

      // Crear un nuevo registro de pago mensual con ID único
      const now = new Date();
      const paymentId = uuidv4(); // Generar ID único con UUID
      
      await enrollmentsCollection.updateOne(
        { _id: new ObjectId(enrollmentId) },
        { 
          $push: {
            paymentsMade: {
              _id: paymentId, // Usar el ID único generado
              amount: enrollment.monthlyPaymentAmount || enrollment.paymentAmount,
              date: now,
              proofUrl: relativePath,
              status: 'pending',
              notes: notes,
              submittedAt: now
            }
          } as any
        }
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Comprobante de pago mensual subido correctamente. Un administrador lo revisará pronto.',
        fileUrl: relativePath,
        paymentId: paymentId // Incluir el ID del pago creado en la respuesta
      });
    }
    
  } catch (error: any) {
    console.error('Error al subir comprobante de pago:', error);
    return NextResponse.json({ 
      error: 'Error al procesar la solicitud',
      details: error.message
    }, { status: 500 });
  }
}

// GET /api/student/enrollments/[id]/payment-proof - Obtener comprobantes de pago
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación y obtener ID del usuario
    const userId = await getUserId(req);
    
    // Obtener el ID de la inscripción
    const enrollmentId = params.id;
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
  } catch (error: any) {
    console.error('Error al obtener información de pago mensual:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
