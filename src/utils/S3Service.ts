import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file');
  }
}
