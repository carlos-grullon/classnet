'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'danger' | 'success';
  isLoading?: boolean;
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'primary',
  isLoading = false,
}: ConfirmationModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus confirm button when modal opens
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  const buttonVariants = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700',
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                type: 'spring',
                damping: 20,
                stiffness: 300,
                bounce: 0.3,
                duration: 0.15
              }
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 10,
              transition: {
                duration: 0.1,
                ease: 'easeIn'
              }
            }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2">
                <FiAlertTriangle className="text-yellow-500" size={24} />
                <h3 className="text-xl font-medium text-center">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="text-gray-700 dark:text-gray-300">{message}</div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="danger"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                <Button
                  ref={confirmButtonRef}
                  className={buttonVariants[confirmColor]}
                  onClick={handleConfirm}
                  isLoading={isLoading}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
