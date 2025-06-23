import { NextResponse, NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string | null;
    console.log('path recibido en endpoint:', path); // Verificar valor
    
    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipos de archivo (manteniendo tu lista existente)
    const allowedTypes = [
      // Imágenes
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      
      // Documentos
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/csv',
      
      // Audio
      'audio/wav', 'audio/webm', 'audio/mpeg', // MP3
      'audio/ogg',
      
      // Texto/otros
      'text/plain',
      'application/json'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado" }, 
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extension = file.name.split(".").pop() || 
      (file.type === 'audio/wav' ? 'wav' : 
       file.type === 'audio/webm' ? 'webm' : 
       file.type === 'audio/mpeg' ? 'mp3' : 'bin');
    
    const key = path ? `${path}/${uuidv4()}.${extension}` : `${uuidv4()}.${extension}`;

    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
        Body: buffer,
        ContentType: file.type,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
