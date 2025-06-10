'use client';

import React, { useState, useRef } from 'react';
import { Card, Button, Modal } from '@/components';
import { FiClock, FiCheckCircle, FiUpload, FiAlertTriangle, FiCalendar } from 'react-icons/fi';
import { FetchData, ErrorMsj } from '@/utils/Tools.tsx';
import { formatDateLong, formatCurrency } from '@/utils/GeneralTools.ts';
import Image from 'next/image';

// Interfaz para los pagos mensuales
interface Payment {
  _id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  proofUrl?: string;
  notes?: string;
  approvedAt?: string;
  rejectedAt?: string;
  paymentDueDate: string;
}

// Interfaz para la información de pagos
interface PaymentInfo {
  enrollmentId: string;
  className: string;
  classLevel: string;
  monthlyAmount: number;
  currency: string;
  nextPaymentDueDate?: string;
  lastPaymentDate?: string;
  paymentsMade: Payment[];
  status: string;
}

interface MonthlyPaymentSectionProps {
  enrollmentId: string;
  onOpenPaymentModal?: (paymentId?: string) => void;
}

export function MonthlyPaymentSection({ enrollmentId, onOpenPaymentModal }: MonthlyPaymentSectionProps) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState('');
  
  // Cargar datos de pagos mensuales
  React.useEffect(() => {
    if (enrollmentId) {
      fetchPaymentInfo();
    }
  }, [enrollmentId]);
  
  const fetchPaymentInfo = async () => {
    setIsLoading(true);
    try {
      const response = await FetchData(`/api/student/enrollments/${enrollmentId}/payment-proof`, {}, 'GET');
      if (response) {
        setPaymentInfo(response);
      } else {
        ErrorMsj('Error al cargar la información de pagos');
      }
    } catch (error: any) {
      console.error('Error al cargar información de pagos:', error);
      ErrorMsj(error.message || 'Error al cargar la información de pagos');
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir modal para ver imagen
  const openImageModal = (imageUrl: string) => {
    console.log('Abriendo imagen:', imageUrl);
    setSelectedPaymentProof(imageUrl);
    setIsImageModalOpen(true);
  };

  // Obtener color según estado del pago
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'pending':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'overdue':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  // Obtener icono según estado del pago
  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <FiCheckCircle className="mr-2" />;
      case 'pending':
        return <FiClock className="mr-2" />;
      case 'overdue':
        return <FiAlertTriangle className="mr-2" />;
      default:
        return <FiClock className="mr-2" />;
    }
  };

  // Obtener texto según estado del pago
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencido';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Card className="p-6 mx-auto" fullWidth>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FiCalendar className="mr-2" />
        Pagos Mensuales
        {/* Botón para subir comprobante */}
        {paymentInfo?.nextPaymentDueDate && !isLoading && (
          <div className="ms-auto">
            <Button
              onClick={() => onOpenPaymentModal && onOpenPaymentModal()}
              disabled={isLoading}
              icon={<FiUpload />}
            >
              Subir Comprobante de Pago
            </Button>
          </div>
        )}
      </h2>
      
      {isLoading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-700 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Cargando información de pagos...</p>
        </div>
      ) : !paymentInfo ? (
        <div className="text-center p-8">
          <p className="text-gray-500 dark:text-gray-400">No hay información de pagos mensuales disponible.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumen de pagos */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monto mensual:</p>
                <p className="font-medium text-lg">{formatCurrency(paymentInfo.monthlyAmount)} {paymentInfo.currency}</p>
              </div>
              {paymentInfo.nextPaymentDueDate && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Próximo pago:</p>
                  <p className="font-medium text-lg">{formatDateLong(new Date(paymentInfo.nextPaymentDueDate))}</p>
                </div>
              )}
              {paymentInfo.lastPaymentDate && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Último pago:</p>
                  <p className="font-medium text-lg">{formatDateLong(new Date(paymentInfo.lastPaymentDate))}</p>
                </div>
              )}
            </div>
          </div>

          {/* Historial de pagos */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Historial de Pagos</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPaymentInfo}
                disabled={isLoading}
              >
                {isLoading ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
            {paymentInfo.paymentsMade && paymentInfo.paymentsMade.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-4 py-3">Fecha</th>
                      <th scope="col" className="px-4 py-3">Monto</th>
                      <th scope="col" className="px-4 py-3">Estado</th>
                      <th scope="col" className="px-4 py-3">Pago correspondiente a:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentInfo.paymentsMade.map((payment, index) => (
                      <tr key={payment._id || `payment-${index}`} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                        <td className="px-4 py-3">{formatDateLong(new Date(payment.date))}</td>
                        <td className="px-4 py-3">{formatCurrency(payment.amount)} {paymentInfo.currency}</td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                            {getPaymentStatusIcon(payment.status)}
                            {getPaymentStatusText(payment.status)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {payment.status === 'pending' ? (
                            <div className="flex space-x-2">
                              {payment.proofUrl ? (
                                <>
                                  <button
                                    onClick={() => openImageModal(payment.proofUrl!)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                  >
                                    Ver comprobante
                                  </button>
                                  <button
                                    onClick={() => onOpenPaymentModal && onOpenPaymentModal(payment._id)}
                                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 underline"
                                  >
                                    Cambiar
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => onOpenPaymentModal && onOpenPaymentModal()}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                >
                                  Subir comprobante
                                </button>
                              )}
                            </div>
                          ) : payment.status === 'paid' ? (
                            <div>
                              <span className="text-gray-700 dark:text-gray-300 text-center w-full block">
                                {formatDateLong(new Date(payment.paymentDueDate))}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay pagos registrados aún.</p>
            )}
          </div>
        </div>
      )}

      {/* Modal simple para ver imagen */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Botón para cerrar */}
            <button 
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Título */}
            <h3 className="text-lg font-semibold mb-4 text-center">Comprobante de Pago</h3>
            
            {/* Imagen */}
            <div className="flex justify-center">
              <a href={selectedPaymentProof} target="_blank" rel="noopener noreferrer">
                <img 
                  src={selectedPaymentProof} 
                  alt="Comprobante de pago" 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </a>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
