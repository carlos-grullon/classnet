import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { getUserId } from '@/utils/Tools.ts';
import { ObjectId } from 'mongodb';

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
    
    // Verificar que la inscripción esté en estado pendiente de pago
    if (enrollment.status !== 'pending_payment') {
      return NextResponse.json({ 
        error: 'La inscripción no está en estado pendiente de pago',
        status: enrollment.status
      }, { status: 400 });
    }
    
    const body = await req.json();
    const { paymentProofUrl } = body;
    
    if (!paymentProofUrl) {
      return NextResponse.json({ error: 'URL de comprobante de pago requerida' }, { status: 400 });
    }
    
    // Verificar que la URL sea válida (debe ser una URL local de nuestro sistema)
    if (!paymentProofUrl.startsWith('/uploads/payment-proofs/')) {
      return NextResponse.json({ error: 'URL de comprobante de pago inválida' }, { status: 400 });
    }
    
    // Actualizar inscripción con comprobante de pago
    await enrollmentsCollection.updateOne(
      { _id: new ObjectId(enrollmentId) },
      { 
        $set: { 
          paymentProof: paymentProofUrl,
          status: 'proof_submitted',
          updatedAt: new Date() 
        } 
      }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Comprobante de pago enviado correctamente',
      enrollment: {
        id: enrollment._id,
        status: enrollment.status,
        updatedAt: enrollment.updatedAt
      }
    });
    
  } catch (error: any) {
    console.error('Error al subir comprobante de pago:', error);
    return NextResponse.json({ 
      error: 'Error al procesar la solicitud',
      details: error.message
    }, { status: 500 });
  }
}
