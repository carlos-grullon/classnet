// src/app/api/upload-profile-picture/route.ts

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path'; 
import { getCollection } from '@/utils/MongoDB';

// ** MUY IMPORTANTE **
// Esta configuración deshabilita el body parser por defecto de Next.js para esta ruta.
// Es necesario para poder procesar 'multipart/form-data' manualmente con formidable.
export const config = {
  api: {
    bodyParser: false,
  },
};

// Verificar configuración de Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary configuration is missing in environment variables');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper para procesar la subida del archivo con modern Request API
// Devuelve una promesa con los campos de texto y los archivos parseados.
const uploadFile = async (req: Request): Promise<{ fields: any, files: any }> => {
  const formData = await req.formData();
  const file = formData.get('profilePicture') as File;
  const email = formData.get('email') as string;
  
  if (!file) {
    throw new Error('No file uploaded');
  }
  
  if (!email) {
    throw new Error('No email provided');
  }

  // Create temporary file path
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  
  const filePath = path.join(tmpDir, file.name);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  await fsPromises.writeFile(filePath, buffer);
  
  return {
    fields: { email: [email] },
    files: {
      profilePicture: {
        filepath: filePath,
        originalFilename: file.name,
        mimetype: file.type,
        size: file.size
      }
    }
  };
};

// Manejador de la solicitud POST (cuando el frontend envía el archivo)
export async function POST(request: Request) {
  let uploadResult;
  let profilePictureFile;
  
  try {
    // 1. Verificar método HTTP
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // 2. Procesar el archivo entrante
    const { fields, files } = await uploadFile(request);
    profilePictureFile = files.profilePicture;
    const userEmail = fields.email?.[0];

    // 3. Validar que los datos esperados están presentes
    if (!profilePictureFile) {
       // Limpiar temporal si existe
       if (profilePictureFile?.filepath) {
           await fsPromises.unlink(profilePictureFile.filepath).catch(console.error);
       }
      return NextResponse.json({ message: 'No se recibió ningún archivo de imagen.' }, { status: 400 });
    }
    if (!userEmail) {
        // Limpiar temporal si existe
        if (profilePictureFile.filepath) {
             await fsPromises.unlink(profilePictureFile.filepath).catch(console.error);
        }
        return NextResponse.json({ message: 'Email del usuario no proporcionado en la solicitud.' }, { status: 400 });
    }

    // Validaciones adicionales del archivo
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!profilePictureFile.mimetype || !ALLOWED_MIME_TYPES.includes(profilePictureFile.mimetype)) {
        await fsPromises.unlink(profilePictureFile.filepath).catch(console.error);
        return NextResponse.json({ message: 'Solo se permiten imágenes (JPEG, PNG, WEBP)' }, { status: 400 });
    }
    
    if (profilePictureFile.size > MAX_FILE_SIZE) {
        await fsPromises.unlink(profilePictureFile.filepath).catch(console.error);
        return NextResponse.json({ message: 'La imagen debe ser menor a 5MB' }, { status: 400 });
    }

    // 4. Subir el archivo a Cloudinary
    // modern Request API guarda archivos grandes en un path temporal. Cloudinary SDK puede usar este path.
    uploadResult = await cloudinary.uploader.upload(profilePictureFile.filepath, {
       folder: 'profile_pictures', // Opcional: Guardar en una carpeta específica en Cloudinary
       resource_type: 'auto', // 'image' es mejor si solo esperas imágenes
       // Puedes añadir más opciones de transformación aquí si las necesitas
       crop: "fill", width: 200, height: 200 // Ejemplo de redimensionar al subir
    });

    // 5. Limpiar el archivo temporal después de subirlo a Cloudinary
     if (profilePictureFile.filepath) {
          await fsPromises.unlink(profilePictureFile.filepath).catch(console.error);
     }

    // 6. Obtener la colección de usuarios
    const usersCollection = await getCollection('users');

    // 7. Actualizar el documento del usuario
    let updateResult;
    try {
      updateResult = await usersCollection.updateOne(
        { email: userEmail }, // Buscar por email
        { $set: { data: { image_path: uploadResult.secure_url } } }
      );

      // 8. Verificar si el usuario fue encontrado y actualizado
      if (updateResult.matchedCount === 0) {
         await cloudinary.uploader.destroy(uploadResult.public_id).catch(console.error);
         return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
      }
    } catch (e) {
       // Limpiar imagen de Cloudinary si el ID era inválido después de subirla
        await cloudinary.uploader.destroy(uploadResult.public_id).catch(console.error);
       return NextResponse.json({ message: 'Error al actualizar el perfil del usuario.' }, { status: 400 });
    }

    // 9. Devolver la respuesta de éxito al frontend
    return NextResponse.json({
      message: 'Foto de perfil subida y guardada con éxito.',
      url: uploadResult.secure_url // Devuelve la URL final al frontend
    });

  } catch (error: any) {
    // Manejar errores generales durante el proceso
    console.error('Error en la subida o procesamiento:', error);
    
    // Limpiar imagen de Cloudinary si se subió pero falló después
    if (uploadResult?.public_id) {
      await cloudinary.uploader.destroy(uploadResult.public_id).catch(console.error);
    }
    
    // Limpiar archivo temporal si existe
    if (profilePictureFile?.filepath) {
      await fsPromises.unlink(profilePictureFile.filepath).catch(console.error);
    }
    
    return NextResponse.json({ 
      message: 'Error interno del servidor al procesar la subida.', 
      error: error.message 
    }, { status: 500 });
  }
}