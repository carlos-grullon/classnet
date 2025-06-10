'use client';

import React, { useRef, useState } from 'react';
import { Button, Modal } from '@/components';
import { FiDollarSign, FiUpload, FiCopy, FiCheck } from 'react-icons/fi';
import { ErrorMsj, SuccessMsj } from '@/utils/Tools.tsx';
import { formatCurrency } from '@/utils/GeneralTools';
import Image from 'next/image';

// Interfaz para los detalles bancarios
interface BankDetail {
  id: string;
  name: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  logo_path: string;
  reference: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankDetails: BankDetail[];
  paymentAmount: number;
  currency?: string;
  enrollmentId: string;
  onPaymentSuccess: () => void;
  paymentType: 'enrollment' | 'monthly';
}

export function PaymentModal({
  isOpen,
  onClose,
  bankDetails,
  paymentAmount,
  currency = 'RD$',
  enrollmentId,
  onPaymentSuccess,
  paymentType
}: PaymentModalProps) {
  const [selectedBank, setSelectedBank] = useState<string>(bankDetails[0]?.id || '');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Referencia al input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Función para copiar el número de cuenta al portapapeles
  const copyAccountNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber)
      .then(() => {
        setCopySuccess(true);
        SuccessMsj('Número de cuenta copiado');
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => {
        ErrorMsj('No se pudo copiar el número de cuenta');
      });
  };

  // Manejar la subida de archivos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      ErrorMsj('Tipo de archivo no válido. Por favor sube una imagen (JPG, PNG, GIF) o PDF');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      ErrorMsj('El archivo es demasiado grande. El tamaño máximo es 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('paymentProof', file);
      formData.append('notes', notes);

      // Agregar el tipo de pago al FormData
      formData.append('paymentType', paymentType);
      
      // Enviar el archivo al servidor usando el endpoint actualizado
      const response = await fetch(`/api/student/enrollments/${enrollmentId}/payment-proof`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPaymentProofUrl(URL.createObjectURL(file));
        SuccessMsj('Comprobante subido correctamente');
        onPaymentSuccess();
        onClose();
      } else {
        throw new Error(data.error || 'Error al subir el archivo');
      }
    } catch (error: any) {
      ErrorMsj(error.message || 'Error al subir el comprobante');
    } finally {
      setIsUploading(false);
    }
  };

  // Abrir el selector de archivos
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Realizar Pago"
      className="max-w-xl"
    >
      <div className="space-y-6">
        {/* Datos bancarios */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center text-lg">
            <FiDollarSign className="mr-2" />
            Datos para transferencia bancaria
          </h3>

          {/* Pestañas para seleccionar banco */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 w-full justify-around">
            {bankDetails.map((bank) => (
              <button
                key={bank.id}
                onClick={() => setSelectedBank(bank.id)}
                className={`py-2 px-4 text-sm font-medium flex items-center ${selectedBank === bank.id
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              >
                <div className="w-6 h-6 mr-2 bg-white rounded-md flex items-center justify-center overflow-hidden">
                  <img
                    src={bank.logo_path}
                    alt=""
                    className="w-5 h-5 object-contain"
                  />
                </div>
                {bank.name}
              </button>
            ))}
          </div>

          {/* Detalles del banco seleccionado */}
          {bankDetails.map((bank) => (
            <div
              key={bank.id}
              className={`${selectedBank === bank.id ? 'block' : 'hidden'} space-y-4`}
            >
              <div className="flex items-center space-x-4 mb-5">
                <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center p-2 shadow-md">
                  <img
                    src={bank.logo_path}
                    alt={`Logo de ${bank.name}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-lg">{bank.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{bank.accountType}</p>
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-gray-800 p-5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nombre del titular</p>
                    <p className="font-medium">{bank.accountName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Número de cuenta</p>
                    <div className="flex items-center">
                      <p className="font-medium">{bank.accountNumber}</p>
                      <button 
                        onClick={() => copyAccountNumber(bank.accountNumber)}
                        className="ml-2 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors"
                        title="Copiar número de cuenta"
                      >
                        {copySuccess ? 
                          <FiCheck className="text-green-500" /> : 
                          <FiCopy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Referencia</p>
                    <p className="font-medium">{bank.reference}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monto a pagar</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(paymentAmount)} {currency}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subir comprobante */}
        <div className="space-y-3 bg-gray-50 dark:bg-gray-800/30 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold flex items-center text-lg">
            <FiUpload className="mr-2" />
            Subir comprobante de pago
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Sube una imagen o PDF de tu comprobante de pago para el mes actual.
          </p>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
            {paymentProofUrl ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <div className="relative w-full h-48 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <Image
                      src={paymentProofUrl}
                      alt="Comprobante de pago"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  ¡Comprobante cargado correctamente!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={triggerFileInput}
                  className="cursor-pointer flex flex-col items-center justify-center py-6"
                >
                  <FiUpload className="text-gray-400 text-3xl mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Haz clic para seleccionar un archivo o arrástralo aquí
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    JPG, PNG, GIF o PDF (máx. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/gif,application/pdf"
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800"
              placeholder="Añade cualquier información adicional sobre tu pago"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={triggerFileInput}
              disabled={isUploading}
              isLoading={isUploading}
            >
              {isUploading ? 'Subiendo...' : 'Subir Comprobante'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
