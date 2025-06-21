import { NextResponse, NextRequest } from "next/server";
import { PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
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

    // Initialize S3 client
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Delete old picture if exists
    if (oldImageUrl) {
      try {
        // Skip deletion for external URLs
        if (!oldImageUrl.includes('amazonaws.com')) {
          console.log('Skipping deletion of external image');
        } else {
          const urlParts = new URL(oldImageUrl);
          const oldKey = urlParts.pathname.substring(1); // Remove leading slash
          if (oldKey) {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: oldKey,
              })
            );
          }
        }
      } catch (error) {
        console.error('Error deleting old image:', error);
        // Continue with upload even if deletion fails
      }
    }

    // Process new upload
    const buffer = Buffer.from(await profilePictureFile.arrayBuffer());
    const extension = profilePictureFile.name.split('.').pop() || 'bin';
    const key = `profile-pictures/${userId}.${extension}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: profilePictureFile.type,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // 6. Obtener la colección de usuarios
    const usersCollection = await getCollection('users');

    // 7. Actualizar el documento del usuario usando ObjectId
    const updateResult = await usersCollection.updateOne(
        { _id: new ObjectId(userId) }, // Buscar por ID
        { $set: { image_path: url, updated_at: new Date() } }
    );

    if (updateResult.matchedCount === 0) {
      // Rollback S3 upload if user not found
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
      }));
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // 9. Devolver la respuesta de éxito al frontend
    return NextResponse.json({
      message: 'Foto de perfil subida con éxito',
      url: url // Devuelve la URL final al frontend
    });
  } catch (error: any) {
    // Manejar errores generales durante el proceso
    console.error('Error en la subida o procesamiento:', error);
    
    return NextResponse.json({ 
      message: 'Error interno del servidor al procesar la subida', 
      error: error.message 
    }, { status: 500 });
  }
}