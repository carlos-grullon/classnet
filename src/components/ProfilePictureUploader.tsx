'use client';

import React, { useState, useEffect } from 'react';

interface UploadResponse {
  url?: string;
  message: string;
  error?: string;
}

interface ProfilePictureUploaderProps {
  email: string | undefined;
  currentImageUrl?: string;
  onUploadSuccess?: (url: string) => void;
  className?: string;
}

export default function ProfilePictureUploader({
  email,
  currentImageUrl,
  onUploadSuccess,
  className = ''
}: ProfilePictureUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const defaultImage = '/images/default-avatar.png';
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setImageUrl(currentImageUrl || defaultImage);
  }, [currentImageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    
    // Validaciones
    if (!file.type.startsWith('image/')) {
      setMessage('Solo se permiten imágenes (JPEG, PNG)');
      e.target.value = '';
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setMessage('La imagen debe ser menor a 5MB');
      e.target.value = '';
      return;
    }
    
    setSelectedFile(file);
    setMessage(`Imagen seleccionada: ${file.name}`);
    
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !email) return;
    
    setUploading(true);
    setMessage('Subiendo imagen...');
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);
      formData.append('email', email);
      
      const res = await fetch('/api/uploadpicture', {
        method: 'POST',
        body: formData
      });
      
      const data: UploadResponse = await res.json();
      
      if (res.ok && data.url) {
        setImageUrl(data.url);
        onUploadSuccess?.(data.url);
        setMessage('¡Imagen actualizada con éxito!');
      } else {
        setMessage(data.error || 'Error al subir la imagen');
      }
    } catch (error) {
      setMessage('Error de conexión');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="flex items-center gap-4">
        {imageUrl && (
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
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
        )}
        
        <div className="flex-1">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Cambiar foto de perfil
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 dark:file:bg-blue-900/30
              file:text-blue-700 dark:file:text-blue-300
              hover:file:bg-blue-100 dark:hover:file:bg-blue-900/40
              cursor-pointer"
            disabled={uploading}
          />
        </div>
      </div>
      
      {message && (
        <p className={`text-sm ${message.includes('éxito') ? 
          'text-green-600 dark:text-green-400' : 
          'text-red-600 dark:text-red-400'}`}>
          {message}
        </p>
      )}
      
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Subiendo...' : 'Guardar cambios'}
        </button>
      )}
    </div>
  );
}