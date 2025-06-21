'use client';

import { FiX } from 'react-icons/fi';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
  altText?: string;
  isOpen?: boolean;
}

export function ImageModal({ 
  imageUrl, 
  onClose, 
  altText = 'Imagen ampliada',
  isOpen = true
}: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Cierra al hacer click en el fondo
    >
      <div 
        className="relative w-[600px] h-[600px] bg-white rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Evita que el click se propague al fondo
      >
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 z-10 bg-white/80 rounded-full p-1"
        >
          <FiX size={20} />
        </button>
        
        <img 
          src={imageUrl} 
          alt={altText}
          className="w-full h-full object-contain p-4"
        />
      </div>
    </div>
  );
}