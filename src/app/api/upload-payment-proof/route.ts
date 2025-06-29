import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/utils/Tools.ts';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import { uploadToS3 } from '@/utils/S3Service';

// Configuración para permitir que Next.js maneje correctamente las solicitudes multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// POST /api/upload-payment-proof - Subir archivo de comprobante de pago
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const studentId = await getUserId(req);
    
    // Obtener el ID de la inscripción del FormData
    const formData = await req.formData();
    const enrollmentId = formData.get('enrollmentId') as string;
    const file = formData.get('file') as File;
    
    if (!enrollmentId) {
      return NextResponse.json({ error: 'ID de inscripción no proporcionado' }, { status: 400 });
    }
    
    if (!file) {
      return NextResponse.json({ error: 'No se ha proporcionado ningún archivo' }, { status: 400 });
    }

    // Verificar si la inscripción existe y pertenece al estudiante
    const enrollmentsCollection = await getCollection('enrollments');
    const enrollment = await enrollmentsCollection.findOne({
      _id: new ObjectId(enrollmentId),
      student_id: new ObjectId(studentId)
    });
    
    if (!enrollment) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 });
    }
    
    // Verificar que la inscripción esté en estado pendiente de pago o comprobante rechazado
    if (enrollment.status !== 'pending_payment' && enrollment.status !== 'proof_rejected') {
      return NextResponse.json({ 
        error: 'La inscripción no está en estado que permita subir comprobante',
        status: enrollment.status
      }, { status: 400 });
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    
    // Ser más flexible con los tipos MIME para JPEG
    const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg' || 
                  file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
    
    if (!validTypes.includes(file.type) && !isJpeg) {
      return NextResponse.json({ 
        error: `Tipo de archivo no válido: ${file.type}. Por favor sube una imagen (JPG, PNG, GIF) o PDF` 
      }, { status: 400 });
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'El archivo es demasiado grande. El tamaño máximo es 5MB' 
      }, { status: 400 });
    }

    // Generar nombre único para el archivo en S3
    const fileUrl = await uploadToS3(file, `payment-proofs/${studentId}`);

    return NextResponse.json({
      success: true,
      fileUrl,
      message: 'Comprobante subido a S3 correctamente'
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al subir archivo:', error);
    return NextResponse.json({ 
      error: message 
    }, { status: 500 });
  }
}
