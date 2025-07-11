"use client";

import { useState, useRef, useCallback } from "react";
import { FiUpload, FiX, FiCheckCircle, FiAlertTriangle, FiFileText } from "react-icons/fi";
import { ErrorMsj, SuccessMsj } from '@/utils/Tools.tsx';

interface FileUploaderProps {
  onUploadSuccess?: (result: { url: string, fileName: string }) => void;
  path?: string;
}

export function FileUploader({ onUploadSuccess, path = ''}: FileUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    // Validar tipo de archivo
    const validTypes = [
      'image/jpeg', 
      'image/jpg',
      'image/png', 
      'image/gif', 
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const fileExtensions = [
      '.jpeg', '.jpg', '.png', '.gif', '.pdf', 
      '.doc', '.docx'
    ];
    
    const isValidType = validTypes.includes(file.type) || 
      fileExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      setError('Tipo de archivo no válido. Sube una imagen (JPEG, JPG, PNG, GIF), PDF o Word (DOC, DOCX)');
      ErrorMsj('Tipo de archivo no válido');
      return;
    }

    // Validar tamaño (25MB máximo)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo es demasiado grande (máximo 25MB)');
      ErrorMsj('Archivo demasiado grande');
      return;
    }

    setError('');
    setFile(file);
    SuccessMsj('Archivo listo para subir');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) { // 'file' es el File object que viene de tu input
      setError('Por favor, selecciona un archivo primero.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // PASO 1: Solicitar la URL pre-firmada a tu API Route
      // Tu API Route '/api/upload-files' ahora espera un JSON con el nombre, tipo y path.
      const getUrlResponse = await fetch('/api/upload-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // ¡Importante! Ahora envías JSON
        },
        body: JSON.stringify({ 
          fileName: file.name,   // El nombre original del archivo
          fileType: file.type,   // El tipo MIME del archivo
          path: path             // La carpeta de destino en S3
        }),
      });
  
      if (!getUrlResponse.ok) {
        const errorData = await getUrlResponse.json();
        throw new Error(`Error al obtener URL pre-firmada: ${errorData.error || getUrlResponse.statusText}`);
      }
  
      // Desestructuramos la respuesta para obtener la URL pre-firmada y la URL pública final de S3
      const { presignedUrl, s3ObjectUrl } = await getUrlResponse.json();
      
      // PASO 2: Subir el archivo directamente a S3 usando la URL pre-firmada
      // Aquí el 'file' (el objeto File completo) se envía directamente a S3.
      const uploadToS3Response = await fetch(presignedUrl, {
        method: 'PUT', // Para subidas directas de objetos individuales, siempre es PUT
        headers: {
          'Content-Type': file.type, // Asegúrate que el Content-Type coincida con el generado en la URL
          // Si al generar la URL pre-firmada en S3Service.ts usaste ACL: 'public-read',
          // a veces es necesario incluir también el header 'x-amz-acl': 'public-read' aquí.
          // Prueba sin él primero, y si hay problemas, descoméntalo:
          // 'x-amz-acl': 'public-read',
        },
        body: file, // ¡Aquí es donde envías el archivo (File object) directamente a S3!
      });
  
      if (!uploadToS3Response.ok) {
        // Los errores de S3 directo suelen venir en texto/XML, no JSON
        const errorText = await uploadToS3Response.text();
        throw new Error(`Fallo al subir el archivo a S3: ${uploadToS3Response.status} - ${errorText}`);
      }
      const result = {
        url: s3ObjectUrl, // Usamos la URL pública de S3
        fileName: file.name
      }
      // PASO 3: Manejar el éxito
      // Ahora 's3ObjectUrl' es la URL pública del archivo en S3
      onUploadSuccess?.({
        url: result.url,
        fileName: result.fileName
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al subir');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };



  // const handleUpload = async () => {
  //   if (!file) return;
    
  //   try {
  //     setIsLoading(true);
  //     setError('');
      
  //     const formData = new FormData();
  //     formData.append('file', file);
  //     formData.append('path', path); // Enviamos la ruta al endpoint
      
  //     const response = await fetch('/api/upload-files', {
  //       method: 'POST',
  //       body: formData
  //     });
      
  //     if (!response.ok) throw new Error('Upload failed');
      
  //     const result = await response.json();
  //     onUploadSuccess?.({
  //       url: result.url,
  //       fileName: file.name
  //     });
      
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Upload error');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const removeFile = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="mt-4 flex justify-center">
          <img 
            src={URL.createObjectURL(file)} 
            alt="Vista previa"
            className="max-h-40 max-w-full rounded-md object-contain"
          />
        </div>
      );
    }
    
    return (
      <div className="mt-4 flex flex-col items-center text-gray-500">
        {file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx') ? (
          <FiFileText className="w-12 h-12 text-blue-500" />
        ) : (
          <FiFileText className="w-12 h-12" />
        )}
        <span className="mt-2 text-sm">{file.name}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-600'}
          ${error ? 'border-red-500 dark:border-red-500' : ''}
        `}
      >
        <input 
          ref={inputRef}
          type="file" 
          onChange={handleChange} 
          className="hidden" 
          accept="image/*,.pdf,.doc,.docx"
        />
        
        {!file ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <FiUpload className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Arrastra y suelta archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Formatos soportados: JPEG, JPG, PNG, GIF, PDF, Word (DOC, DOCX) (máx. 25MB)
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-md p-2 mb-4">
              <FiCheckCircle className="text-green-500" />
              <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="text-gray-500 hover:text-red-500"
              >
                <FiX />
              </button>
            </div>
            {getFilePreview(file)}
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <FiAlertTriangle />
          <span>{error}</span>
        </div>
      )}

      {file && (
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className={`
            w-full py-2 px-4 rounded-md transition-colors
            ${isLoading 
              ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'}
          `}
        >
          {isLoading ? 'Subiendo...' : 'Subir archivo'}
        </button>
      )}
    </div>
  );
}
