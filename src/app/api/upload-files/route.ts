import { NextResponse, NextRequest } from "next/server";
import { getPresignedUploadUrl } from '@/utils/S3Service';
// import { uploadToS3 } from '@/utils/S3Service';

export async function POST(request: NextRequest) {
  try {
    // Aquí, ya NO esperamos un 'formData' con el archivo completo.
    // Solo esperamos un JSON con el nombre del archivo, su tipo y el path.
    const { fileName, fileType, path } = await request.json(); 
    
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Faltan datos: nombre y tipo de archivo son requeridos." },
        { status: 400 }
      );
    }

    // Validación de tipos de archivo (mantenemos la lista aquí también por si acaso)
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
    
    if (!allowedTypes.includes(fileType)) { // Usamos fileType aquí
      return NextResponse.json(
        { error: "Tipo de archivo no soportado" }, 
        { status: 400 }
      );
    }

    // Llama a la nueva función para obtener la URL pre-firmada
    const { url: presignedUrl, s3ObjectUrl } = await getPresignedUploadUrl(fileName, fileType, path || 'uploads');

    // Retorna la URL pre-firmada y la URL pública final del objeto
    return NextResponse.json({ presignedUrl, s3ObjectUrl });

  } catch (error) {
    console.error("Error al generar URL pre-firmada:", error);
    return NextResponse.json({ error: "Fallo al generar URL de subida" }, { status: 500 });
  }
}

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file') as File;
//     const path = formData.get('path') as string | null;
    
//     if (!file) {
//       return NextResponse.json(
//         { error: "No se proporcionó ningún archivo" },
//         { status: 400 }
//       );
//     }

//     // Validar tipos de archivo (manteniendo tu lista existente)
//     const allowedTypes = [
//       // Imágenes
//       'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      
//       // Documentos
//       'application/pdf',
//       'application/msword', // .doc
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
//       'application/vnd.ms-powerpoint', // .ppt
//       'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
//       'application/vnd.ms-excel', // .xls
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
//       'text/csv',
      
//       // Audio
//       'audio/wav', 'audio/webm', 'audio/mpeg', // MP3
//       'audio/ogg',
      
//       // Texto/otros
//       'text/plain',
//       'application/json'
//     ];
    
//     if (!allowedTypes.includes(file.type)) {
//       return NextResponse.json(
//         { error: "Tipo de archivo no soportado" }, 
//         { status: 400 }
//       );
//     }

//     const fileUrl = await uploadToS3(file, path || 'uploads');

//     return NextResponse.json({ url: fileUrl });
//   } catch (error) {
//     console.error("Upload error:", error);
//     return NextResponse.json({ error: "Upload failed" }, { status: 500 });
//   }
// }