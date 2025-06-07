'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components';
import { FiList, FiClock, FiCheckCircle, FiXCircle, FiUpload, FiAlertTriangle } from 'react-icons/fi';
import { FetchData, ErrorMsj, formatDate, getLevelName } from '@/utils/Tools.tsx';
import { useRouter } from 'next/navigation';

// Interfaz para las inscripciones
interface Enrollment {
  _id: string;
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

export default function StudentEnrollments() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const response = await FetchData('/api/student/enrollments', {}, 'GET');
      if (response.success) {
        setEnrollments(response.enrollments);
      }
    } catch (error: any) {
      ErrorMsj('Error al cargar las inscripciones');
      console.error(error);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Mis Inscripciones</h1>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700 dark:border-primary-400 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Cargando inscripciones...</p>
          </div>
        ) : enrollments.length > 0 ? (
          <div className="space-y-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment._id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg dark:text-white">
                      {enrollment.class.subjectName} - {getLevelName(enrollment.class.level)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Profesor/a: <span className='font-bold'>{enrollment.class.teacherName}</span>
                    </p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(enrollment.status)}`}>
                      {getStatusIcon(enrollment.status)}
                      {getStatusText(enrollment.status)}
                    </div>
                    {enrollment.status === 'pending_payment' && enrollment.expiresAt && (
                      <p className={`text-sm ${isExpired(enrollment) ? 'text-red-500' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {isExpired(enrollment) 
                          ? 'Plazo de pago expirado' 
                          : `Expira: ${formatDate(new Date(enrollment.expiresAt))}`}
                      </p>
                    )}
                    {enrollment.status === 'proof_rejected' && enrollment.notes && (
                      <p className="text-sm text-red-500">
                        Motivo: {enrollment.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-600 dark:text-gray-300 text-right">
                      Precio: <span className='font-bold'>${enrollment.paymentAmount}</span>
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => router.push(`/student/enrollments/${enrollment._id}`)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <FiList className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tienes inscripciones</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Aún no te has inscrito a ninguna clase.
            </p>
            <Button onClick={() => router.push('/student/searchclasses')}>
              Buscar Clases
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
