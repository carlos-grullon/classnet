"use client";

import { useState, useRef, useCallback } from "react";
import { FiUpload, FiX, FiCheckCircle, FiAlertTriangle, FiFileText, FiImage } from "react-icons/fi";
import { ErrorMsj, SuccessMsj } from '@/utils/Tools.tsx';

interface FileUploaderProps {
  onUploadSuccess?: (url: string) => void;
}

export function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [url, setUrl] = useState("");
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

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo es demasiado grande (máximo 5MB)');
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
    if (!file) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-files", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setUrl(data.url);
        SuccessMsj('Archivo subido correctamente');
        // Limpiar después de subir
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
        // Ejecutar callback si existe
        if (onUploadSuccess) {
          onUploadSuccess(data.url);
        }
      } else {
        throw new Error(data.error || 'Error al subir el archivo');
      }
    } catch (err: any) {
      setError(err.message);
      ErrorMsj(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUrl('');
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
              Formatos soportados: JPEG, JPG, PNG, GIF, PDF, Word (DOC, DOCX) (máx. 5MB)
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
