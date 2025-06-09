'use client';

import React, { useState, useRef } from 'react';
import { Card, Button, Modal } from '@/components';
import { FiClock, FiCheckCircle, FiUpload, FiAlertTriangle, FiCalendar } from 'react-icons/fi';
import { FetchData, ErrorMsj, SuccessMsj } from '@/utils/Tools.tsx';
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

interface MonthlyPaymentSectionProps {
  enrollmentId: string;
  onOpenPaymentModal?: () => void;
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
              onClick={onOpenPaymentModal || (() => {})}
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
            <h3 className="text-lg font-medium mb-3">Historial de Pagos</h3>
            {paymentInfo.paymentsMade && paymentInfo.paymentsMade.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-4 py-3">Fecha</th>
                      <th scope="col" className="px-4 py-3">Monto</th>
                      <th scope="col" className="px-4 py-3">Estado</th>
                      <th scope="col" className="px-4 py-3">Comprobante</th>
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
                          {payment.proofUrl ? (
                            <button
                              onClick={() => openImageModal(payment.proofUrl!)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                            >
                              Ver comprobante
                            </button>
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

      {/* Modal para ver imagen */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Comprobante de Pago"
        className="max-w-2xl"
      >
        <div className="relative w-full h-96 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <Image
            src={selectedPaymentProof}
            alt="Comprobante de pago"
            fill
            className="object-contain"
          />
        </div>
      </Modal>
    </Card>
  );
}
