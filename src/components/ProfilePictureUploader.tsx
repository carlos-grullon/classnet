'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { FiUpload, FiX, FiCheckCircle, FiImage } from 'react-icons/fi';
import { ErrorMsj, SuccessMsj } from '@/utils/Tools.tsx';

interface ProfilePictureUploaderProps {
  currentImageUrl?: string;
  onUploadSuccess?: (url: string) => void;
  className?: string;
  editMode?: boolean;
  onImageClick?: () => void;
}

export function ProfilePictureUploader({
  currentImageUrl,
  onUploadSuccess,
  className = '',
  editMode = false,
  onImageClick
}: ProfilePictureUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const defaultImage = '/images/default-avatar.png';
  const [imageUrl, setImageUrl] = useState<string>(currentImageUrl || defaultImage);

  useEffect(() => {
    if (currentImageUrl) {
      setImageUrl(currentImageUrl);
    } else {
      setImageUrl(defaultImage);
    }
  }, [currentImageUrl]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
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
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (JPEG, PNG)');
      ErrorMsj('Tipo de archivo no válido');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      ErrorMsj('Imagen demasiado grande');
      return;
    }

    setError('');
    setFile(file);
    setImageUrl(URL.createObjectURL(file));
    SuccessMsj('Imagen lista para subir');
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
      formData.append('profilePicture', file);
      
      // Only send oldImageUrl if it's from our S3
      if (currentImageUrl && currentImageUrl.includes('amazonaws.com')) {
        formData.append('oldImageUrl', currentImageUrl);
      }

      const res = await fetch('/api/update-profile-picture', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok && data.url) {
        setImageUrl(data.url);
        setFile(null); // Clear selected file
        if (onUploadSuccess) onUploadSuccess(data.url);
        SuccessMsj('Imagen actualizada correctamente');
      } else {
        throw new Error(data.error || 'Error al subir la imagen');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir la imagen';
      setError(message);
      ErrorMsj(message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setImageUrl(currentImageUrl || defaultImage);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div 
          className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 cursor-pointer"
          onClick={onImageClick}
        >
          <img 
            src={imageUrl} 
            alt="Foto de perfil"
            className="object-cover h-full w-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
              setImageUrl(defaultImage);
            }}
          />
        </div>

        {editMode && (
          <div className="flex-1 max-w-md overflow-hidden">
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${isDragActive ? 
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 
                  'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
                w-full overflow-hidden`}
            >
              <input 
                ref={inputRef}
                type="file" 
                onChange={handleChange} 
                className="hidden" 
                accept="image/*"
              />
              
              {!file ? (
                <div className="flex flex-col items-center justify-center space-y-2 overflow-hidden">
                  <FiUpload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate w-full px-2">
                    Arrastra y suelta una imagen aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full px-2">
                    Formatos soportados: JPEG, PNG (máx. 5MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md w-full">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium truncate flex-1 min-w-0">{file.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(); }}
                    className="text-gray-500 hover:text-red-500 flex-shrink-0"
                  >
                    <FiX />
                  </button>
                </div>
              )}
            </div>

            {file && (
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md
                  disabled:opacity-50 disabled:cursor-not-allowed w-full truncate"
              >
                {isLoading ? 'Subiendo...' : 'Subir imagen'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}