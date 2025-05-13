'use client';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ReactNode } from 'react';
import { FiX, FiPlus, FiMinus, FiRotateCw } from 'react-icons/fi';

interface ImageModalProps {
  imageUrl?: string;
  onClose: () => void;
  altText?: string;
  children?: ReactNode;
}

export default function ImageModal({
  imageUrl,
  onClose,
  altText = 'Imagen ampliada',
  children
}: ImageModalProps) {
  return (
    <AnimatePresence>
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-w-6xl w-full h-[90vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">{altText}</h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-100 rounded-full transition-colors"
                aria-label="Cerrar modal"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            
            {/* Main content area */}
            <div className="flex-1 relative overflow-hidden">
              {imageUrl ? (
                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={8}
                  wheel={{ step: 0.1 }}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      <TransformComponent 
                        wrapperClass="absolute inset-0"
                        contentClass="flex items-center justify-center h-full"
                      >
                        <Image
                          src={imageUrl}
                          alt={altText}
                          width={800}
                          height={800}
                          className="object-contain max-h-full max-w-full"
                          unoptimized
                        />
                      </TransformComponent>
                      
                      {/* Floating controls */}
                      <div className="absolute bottom-4 right-4 flex gap-2 bg-white/90 dark:bg-gray-700/90 p-2 rounded-lg shadow-md">
                        <button 
                          onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          aria-label="Acercar"
                        >
                          <FiPlus className="text-lg text-gray-800 dark:text-gray-200" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          aria-label="Alejar"
                        >
                          <FiMinus className="text-lg text-gray-800 dark:text-gray-200" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); resetTransform(); }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          aria-label="Resetear zoom"
                        >
                          <FiRotateCw className="text-lg text-gray-800 dark:text-gray-200" />
                        </button>
                      </div>
                    </>
                  )}
                </TransformWrapper>
              ) : children ? (
                children
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No hay imagen disponible
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
