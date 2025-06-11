'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, MonthlyPaymentSection, PaymentModal } from '@/components';
import { FiClock, FiCheckCircle, FiXCircle, FiUpload, FiAlertTriangle, FiDollarSign, FiFileText } from 'react-icons/fi';
import { FetchData, ErrorMsj, SuccessMsj, formatDate, getLevelName, getDayName } from '@/utils/Tools.tsx';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency } from '@/utils/GeneralTools';

// Interfaz para la inscripción
interface Enrollment {
  id: string;
  status: 'pending_payment' | 'proof_submitted' | 'enrolled' | 'proof_rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  paymentAmount: number;
  paymentProof?: string;
  notes?: string;
  class: {
    _id: string;
    name: string;
    subjectName: string;
    teacherName: string;
    price: number;
    level: string;
    selectedDays: string[];
    startTime: string;
    endTime: string;
  };
}

// Datos bancarios simulados (en producción estos vendrían de la configuración del sistema)
const bankDetails = [
  {
    id: "popular",
    name: "Banco Popular",
    accountName: "ClassNet Educación",
    accountNumber: "819479916",
    accountType: "Cuenta Corriente",
    logo_path: "/images/banco-popular-logo.png",
    reference: "Pago de clase"
  },
  {
    id: "reservas",
    name: "BanReservas",
    accountName: "ClassNet Educación",
    accountNumber: "9608415786",
    accountType: "Cuenta Corriente",
    logo_path: "/images/banreservas-logo.png",
    reference: "Pago de clase"
  },
  {
    id: "bhd",
    name: "Banco BHD León",
    accountName: "ClassNet Educación",
    accountNumber: "26371340015",
    accountType: "Cuenta de Ahorros",
    logo_path: "/images/bhd-logo.png",
    reference: "Pago de clase"
  }
];

export default function EnrollmentDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentPaymentType, setCurrentPaymentType] = useState<'enrollment' | 'monthly'>('enrollment');
  const [currentPaymentId, setCurrentPaymentId] = useState<string | undefined>(undefined);
  const enrollmentId = params.id;

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollmentDetails();
    }
  }, [enrollmentId]);

  const fetchEnrollmentDetails = async () => {
    setIsLoading(true);
    try {
      const response = await FetchData(`/api/student/enrollments/${enrollmentId}`, {}, 'GET');
      if (response.success) {
        setEnrollment(response.enrollment);
      } else {
        ErrorMsj('Error al cargar los detalles de la inscripción');
        router.push('/student/enrollments');
      }
    } catch (error: any) {
      ErrorMsj('Error al cargar los detalles de la inscripción');
      console.error(error);
      router.push('/student/enrollments');
    } finally {
      setIsLoading(false);
    }
  };

  // El ID de la inscripción ya está definido arriba

  // Función para obtener el color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'proof_submitted':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'enrolled':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'proof_rejected':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'cancelled':
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  // Función para obtener el icono según el estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <FiClock className="mr-2" />;
      case 'proof_submitted':
        return <FiUpload className="mr-2" />;
      case 'enrolled':
        return <FiCheckCircle className="mr-2" />;
      case 'proof_rejected':
        return <FiAlertTriangle className="mr-2" />;
      case 'cancelled':
        return <FiXCircle className="mr-2" />;
      default:
        return <FiClock className="mr-2" />;
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'Pendiente de Pago';
      case 'proof_submitted':
        return 'Comprobante Enviado';
      case 'enrolled':
        return 'Inscrito';
      case 'proof_rejected':
        return 'Comprobante Rechazado';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  // Función para verificar si una inscripción está expirada
  const isExpired = (enrollment: Enrollment) => {
    if (enrollment.status !== 'pending_payment' || !enrollment.expiresAt) return false;
    return new Date(enrollment.expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700 dark:border-primary-400 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Cargando detalles de la inscripción...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-red-500 mb-4">
              <FiAlertTriangle className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Inscripción no encontrada</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              No se encontró la inscripción solicitada.
            </p>
            <Button onClick={() => router.push('/student/enrollments')}>
              Volver a Mis Inscripciones
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detalles de Inscripción</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/student/enrollments')}
          >
            Volver a Mis Inscripciones
          </Button>
        </div>

        <div className="grid md:grid-cols-12 gap-4 ">
          {/* Estado de la inscripción */}
          <Card className="p-6 md:col-span-2">

            <h2 className="text-lg font-semibold mb-2">Estado de la Inscripción</h2>
            <div className="flex flex-col items-center justify-center">

              <div className={`inline-flex items-center max-w-full m-1 mb-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(enrollment.status)}`}>
                {getStatusIcon(enrollment.status)}
                {getStatusText(enrollment.status)}
              </div>



              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Fecha de inscripción:
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(new Date(enrollment.createdAt))}
                </p>
              </div>
              {enrollment.status === 'pending_payment' && enrollment.expiresAt && (
                <p className={`text-sm mt-1 ${isExpired(enrollment) ? 'text-red-500' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {isExpired(enrollment)
                    ? 'Plazo de pago expirado'
                    : `Expira: ${formatDate(new Date(enrollment.expiresAt))}`}
                </p>
              )}
            </div>


            {enrollment.status === 'proof_rejected' && enrollment.notes && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Motivo del rechazo:</strong> {enrollment.notes}
                </p>
              </div>
            )}

            {enrollment.status === 'pending_payment' && !isExpired(enrollment) && (
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setCurrentPaymentType('enrollment');
                    setIsPaymentModalOpen(true);
                  }}
                  icon={<FiDollarSign />}
                >
                  Realizar Pago
                </Button>
              </div>
            )}

            {enrollment.status === 'proof_rejected' && (
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setCurrentPaymentType('enrollment');
                    setIsPaymentModalOpen(true);
                  }}
                  variant="primary"
                  className="w-full"
                >
                  Subir Comprobante de Pago
                </Button>
              </div>
            )}
          </Card>

          {/* Detalles de la clase */}
          <Card className="p-6 md:col-span-4">
            <h2 className="text-lg font-semibold mb-4">Detalles de la Clase</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-12">
                <p className="text-gray-700 dark:text-gray-300 col-span-3">Materia:</p>
                <p className="font-medium col-span-9">{enrollment.class.subjectName}</p>
              </div>
              <div className="grid grid-cols-12">
                <p className="text-gray-700 dark:text-gray-300 col-span-3">Nivel:</p>
                <p className="font-medium col-span-9">{getLevelName(enrollment.class.level)}</p>
              </div>
              <div className="grid grid-cols-12">
                <p className="text-gray-700 dark:text-gray-300 col-span-3">Profesor:</p>
                <p className="font-medium col-span-9">{enrollment.class.teacherName}</p>
              </div>
              <div className="grid grid-cols-12">
                <p className="text-gray-700 dark:text-gray-300 col-span-3">Días:</p>
                <p className="font-medium col-span-9">{getDayName(enrollment.class.selectedDays)}</p>
              </div>
              <div className="grid grid-cols-12">
                <p className="text-gray-700 dark:text-gray-300 col-span-3">Horario:</p>
                <p className="font-medium col-span-9">{enrollment.class.startTime} - {enrollment.class.endTime}</p>
              </div>
              <div className="grid grid-cols-12">
                <p className="text-gray-700 dark:text-gray-300 col-span-3">Precio:</p>
                <p className="font-medium text-blue-600 dark:text-blue-400 col-span-9">{formatCurrency(enrollment.paymentAmount)}</p>
              </div>
            </div>
          </Card>

          {/* Comprobante de pago (si existe) */}
          {enrollment.paymentProof && (
            <Card className="p-6 md:col-span-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Comprobante de Pago</h2>
                {enrollment.status === 'proof_submitted' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPaymentType('enrollment');
                      setIsPaymentModalOpen(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <FiUpload className="h-4 w-4" />
                    Cambiar comprobante
                  </Button>
                )}
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="relative w-full h-48 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <Image
                    src={enrollment.paymentProof}
                    alt="Comprobante de pago"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Enviado el {formatDate(new Date(enrollment.updatedAt))}
                </p>
              </div>
            </Card>
          )}
          {/* Sección de pagos mensuales (para inscripciones activas o con pagos pendientes) */}
          {['enrolled', 'proof_submitted', 'proof_rejected'].includes(enrollment.status) && (
            <div className="md:col-span-6">
              <MonthlyPaymentSection 
                enrollmentId={params.id} 
                onOpenPaymentModal={(paymentId) => {
                  // Abrir el modal de pago para pagos mensuales
                  setCurrentPaymentType('monthly');
                  setCurrentPaymentId(paymentId); // Guardar el ID del pago si existe
                  setIsPaymentModalOpen(true);
                }} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal para realizar pago */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setCurrentPaymentId(undefined); // Limpiar el ID del pago al cerrar
        }}
        bankDetails={bankDetails}
        paymentAmount={enrollment?.paymentAmount || 0}
        currency="RD$"
        enrollmentId={params.id}
        onPaymentSuccess={fetchEnrollmentDetails}
        paymentType={currentPaymentType}
        paymentId={currentPaymentId} // Pasar el ID del pago si existe
      />

      {/* Modal para ver imagen ampliada */}
      {enrollment.paymentProof && (
        <Modal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          title="Comprobante de Pago"
        >
          <div className="flex justify-center">
            <div className="relative w-full h-96">
              <Image
                src={enrollment.paymentProof}
                alt="Comprobante de pago"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
