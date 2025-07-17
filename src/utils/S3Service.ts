import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// Configuración compartida del cliente S3
export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Operaciones comunes de S3
export async function deleteS3Object(url: string) {
  try {
    if (!url.startsWith('https://')) return;
    
    const urlObj = new URL(url);
    const key = urlObj.pathname.substring(1);
    
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key
    }));
    
    return true;
  } catch (error) {
    console.error('Error deleting S3 object:', error);
    return false;
  }
}

export async function uploadToS3(file: File, prefix: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${prefix}/${uuidv4()}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    }));

    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error uploading to S3';
    console.error('Error uploading to S3:', error);
    throw new Error(message);
  }
}

// --- Función para obtener una URL pre-firmada para subir ---
export async function getPresignedUploadUrl(
  fileName: string, // Nombre que tendrá el archivo en S3 (incluyendo la ruta y extensión)
  fileType: string, // Tipo MIME del archivo (ej. image/jpeg)
  prefix: string // Prefijo de la carpeta en S3 (ej. 'uploads', 'avatars')
): Promise<{ url: string; s3ObjectUrl: string }> {
  const uniqueFileName = `${prefix}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileName.split('.').pop()}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: uniqueFileName,
    ContentType: fileType
  });

  const signedUrl = await getSignedUrl(s3, command, {
    expiresIn: 60 * 5, // URL válida por 5 minutos (ajusta según necesites)
  });

  // URL pública del objeto una vez subido
  const s3ObjectUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

  return { url: signedUrl, s3ObjectUrl };
}
