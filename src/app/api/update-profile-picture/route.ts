import { NextResponse, NextRequest } from "next/server";
import { uploadToS3, deleteS3Object } from '@/utils/S3Service';
import { getCollection } from "@/utils/MongoDB";
import { getUserId } from "@/utils/Tools.ts";
import { ObjectId } from "mongodb";

// ** MUY IMPORTANTE **
// Esta configuración deshabilita el body parser por defecto de Next.js para esta ruta.
// Es necesario para poder procesar 'multipart/form-data' manualmente con formidable.
export const config = {
    api: {
        bodyParser: false,
    },
};

// POST update-profile-picture para subirla foto y devolver la url
export async function POST(request: NextRequest) {
  try {
    // 1. Obtener userId del token
    const userId = await getUserId(request);
    
    // 2. Procesar el archivo entrante
    const formData = await request.formData();
    const profilePictureFile = formData.get('profilePicture') as File;
    const oldImageUrl = formData.get('oldImageUrl') as string | null;

    // 3. Validar que los datos esperados están presentes
    if (!profilePictureFile || !userId) {
       // Limpiar temporal si existe
       return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Validaciones adicionales del archivo
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!profilePictureFile.type || !ALLOWED_MIME_TYPES.includes(profilePictureFile.type)) {
        return NextResponse.json({ message: 'Solo se permiten imágenes (JPEG, PNG, WEBP)' }, { status: 400 });
    }
    
    if (profilePictureFile.size > MAX_FILE_SIZE) {
        return NextResponse.json({ message: 'La imagen debe ser menor a 5MB' }, { status: 400 });
    }

    // Subir nueva imagen
    const imageUrl = await uploadToS3(profilePictureFile, `profile-pictures/${userId}`);

    // Eliminar imagen anterior si existe
    if (oldImageUrl) {
      await deleteS3Object(oldImageUrl);
    }

    // 6. Obtener la colección de usuarios
    const usersCollection = await getCollection('users');

    // 7. Actualizar el documento del usuario usando ObjectId
    const updateResult = await usersCollection.updateOne(
        { _id: new ObjectId(userId) }, // Buscar por ID
        { $set: { image_path: imageUrl, updated_at: new Date() } }
    );

    if (updateResult.matchedCount === 0) {
      // Rollback S3 upload if user not found
      await deleteS3Object(imageUrl);
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // 9. Devolver la respuesta de éxito al frontend
    return NextResponse.json({
      message: 'Foto de perfil subida con éxito',
      url: imageUrl // Devuelve la URL final al frontend
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error en la subida o procesamiento:', error);
    return NextResponse.json({ 
      message: 'Error interno del servidor al procesar la subida', 
      error: message 
    }, { status: 500 });
  }
}