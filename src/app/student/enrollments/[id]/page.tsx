'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal } from '@/components';
import { FiClock, FiCheckCircle, FiXCircle, FiUpload, FiAlertTriangle, FiDollarSign, FiCalendar, FiFileText } from 'react-icons/fi';
import { FetchData, ErrorMsj, SuccessMsj, formatDate, getLevelName, getDayName } from '@/utils/Tools.tsx';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    accountType: "Cuenta de Ahorros",
    logo_path: "/images/banco-popular-logo.png",
    reference: "Pago de clase"
  },
  {
    id: "reservas",
    name: "BanReservas",
    accountName: "ClassNet Educación",
    accountNumber: "2400056789",
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
  const [isUploading, setIsUploading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState("popular");

  // Acceder directamente al ID
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

  // Crear una referencia al input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      formData.append('file', file);

      // Agregar el ID de la inscripción al FormData
      formData.append('enrollmentId', enrollmentId);

      // Enviar el archivo al servidor usando fetch nativo
      // IMPORTANTE: No establecer Content-Type para que el navegador lo configure automáticamente
      const response = await fetch('/api/upload-payment-proof', {
        method: 'POST',
        body: formData,
        // No incluir headers para que el navegador establezca el Content-Type correcto con boundary
      });

      const data = await response.json();

      if (data.success) {
        setPaymentProofUrl(data.fileUrl);
        SuccessMsj('Comprobante subido correctamente');
      } else {
        throw new Error(data.error || 'Error al subir el archivo');
      }
    } catch (error: any) {
      ErrorMsj(error.message || 'Error al subir el comprobante');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitPaymentProof = async () => {
    if (!paymentProofUrl) {
      ErrorMsj('Por favor sube un comprobante de pago');
      return;
    }

    setIsUploading(true);
    try {
      const response = await FetchData(`/api/student/enrollments/${enrollmentId}/payment-proof`, {
        paymentProofUrl
      }, 'POST');

      if (response.success) {
        SuccessMsj('Comprobante enviado correctamente');
        setIsPaymentModalOpen(false);
        fetchEnrollmentDetails(); // Actualizar datos
      } else {
        ErrorMsj(response.error || 'Error al enviar el comprobante');
      }
    } catch (error: any) {
      ErrorMsj(error.message || 'Error al enviar el comprobante');
    } finally {
      setIsUploading(false);
    }
  };

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
      <div className="max-w-6xl mx-auto">
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
          <Card className="p-6 md:col-span-3">

            <h2 className="text-lg font-semibold mb-2">Estado de la Inscripción</h2>
            <div className="flex flex-col items-center justify-center">

              <div className={`inline-flex items-center max-w-full m-1 mb-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(enrollment.status)}`}>
                {getStatusIcon(enrollment.status)}
                {getStatusText(enrollment.status)}
              </div>



              <p className="text-sm text-gray-500 dark:text-gray-400">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Fecha de inscripción:
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(new Date(enrollment.createdAt))}
                </p>
              </p>
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
                  onClick={() => setIsPaymentModalOpen(true)}
                  icon={<FiDollarSign />}
                >
                  Realizar Pago
                </Button>
              </div>
            )}

            {enrollment.status === 'proof_rejected' && (
              <div className="mt-6">
                <Button
                  onClick={() => setIsPaymentModalOpen(true)}
                  icon={<FiUpload />}
                >
                  Enviar Nuevo Comprobante
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
                <p className="font-medium text-blue-600 dark:text-blue-400 col-span-9">${enrollment.paymentAmount}</p>
              </div>
            </div>
          </Card>

          {/* Comprobante de pago (si existe) */}
          {enrollment.paymentProof && (
            <Card className="p-6 md:col-span-3">
              <h2 className="text-lg font-semibold mb-4">Comprobante de Pago</h2>
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
        </div>
      </div>

      {/* Modal para realizar pago */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
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
                      <p className="font-medium">{bank.accountNumber}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Referencia</p>
                      <p className="font-medium">{bank.reference}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Monto a pagar</p>
                      <p className="font-bold text-blue-600 dark:text-blue-400">${enrollment?.paymentAmount}</p>
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

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
              {paymentProofUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <FiFileText className="text-green-500 w-12 h-12" />
                  </div>
                  <p className="text-green-600 dark:text-green-400">¡Comprobante listo para enviar!</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentProofUrl('')}
                  >
                    Cambiar archivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-500 dark:text-gray-400">
                    Sube una imagen o PDF de tu comprobante de pago
                  </p>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      isLoading={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Seleccionar archivo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitPaymentProof}
              isLoading={isUploading}
              disabled={!paymentProofUrl || isUploading}
            >
              Enviar Comprobante
            </Button>
          </div>
        </div>
      </Modal>

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
