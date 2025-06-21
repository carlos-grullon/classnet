'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from '@/components';
import { FiClock, FiCheckCircle, FiXCircle, FiUpload, FiAlertTriangle, FiSearch, FiEye, FiRefreshCw } from 'react-icons/fi';
import { FetchData, ErrorMsj, SuccessMsj, getLevelName } from '@/utils/Tools.tsx';
import Image from 'next/image';
import { useCallback } from 'react';

// Interfaz para las inscripciones
interface Enrollment {
  id: string;
  status: 'pending_payment' | 'proof_submitted' | 'enrolled' | 'proof_rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  paymentAmount: number;
  paymentProof?: string;
  notes?: string;
  student: {
    _id: string;
    name: string;
    lastName: string;
    email: string;
  };
  class: {
    _id: string;
    name: string;
    subjectName: string;
    teacherName: string;
    price: number;
    level: string;
  };
}

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1, // Comenzar desde la página 1, no 0
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Estado para el modal de detalle y actualización
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    enrollment: null as Enrollment | null
  });

  // Estado para el modal de visualización de comprobante
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: ''
  });

  // Estado para el formulario de actualización
  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: ''
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const fetchEnrollments = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/enrollments?page=${pagination.page}&limit=${pagination.limit}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      const response = await FetchData(url, {}, 'GET');
      if (response.success) {
        setEnrollments(response.enrollments);
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        }));
      } else {
        ErrorMsj('Error al cargar las inscripciones');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      ErrorMsj(message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, statusFilter]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleViewDetails = (enrollment: Enrollment) => {
    setDetailModal({
      isOpen: true,
      enrollment
    });
    setUpdateForm({
      status: enrollment.status,
      notes: enrollment.notes || ''
    });
  };

  const handleViewImage = (imageUrl: string) => {
    setImageModal({
      isOpen: true,
      imageUrl
    });
  };

  const handleUpdateStatus = async () => {
    if (!detailModal.enrollment) return;

    setIsUpdating(true);
    try {
      const response = await FetchData(`/api/admin/enrollments/${detailModal.enrollment.id}/status`, {
        status: updateForm.status,
        notes: updateForm.notes
      }, 'PATCH');

      if (response.success) {
        SuccessMsj('Estado actualizado correctamente');
        setDetailModal({
          isOpen: false,
          enrollment: null
        });
        fetchEnrollments(); // Recargar datos
      } else {
        ErrorMsj(response.error || 'Error al actualizar el estado');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      ErrorMsj(message);
    } finally {
      setIsUpdating(false);
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Inscripciones</h1>
          <Button
            onClick={fetchEnrollments}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar'}
            <span className="ml-2">
              <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            </span>
          </Button>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filtrar por estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2"
                >
                  <option value="">Todos los estados</option>
                  <option value="pending_payment">Pendiente de Pago</option>
                  <option value="proof_submitted">Comprobante Enviado</option>
                  <option value="enrolled">Inscrito</option>
                  <option value="proof_rejected">Comprobante Rechazado</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
              <div className="flex-none self-end">
                <Button
                  onClick={() => fetchEnrollments()}
                  icon={<FiSearch />}
                  variant="outline"
                >
                  Buscar
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700 dark:border-primary-400 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Cargando inscripciones...</p>
          </div>
        ) : enrollments.length > 0 ? (
          <div className="space-y-4">
            {/* Lista de inscripciones */}
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg">
                        {enrollment.class.subjectName} - {getLevelName(enrollment.class.level)}
                      </h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(enrollment.status)}`}>
                        {getStatusIcon(enrollment.status)}
                        {getStatusText(enrollment.status)}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Estudiante: <span className="font-medium">{enrollment.student.name} {enrollment.student.lastName}</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Profesor: <span className="font-medium">{enrollment.class.teacherName}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Fecha: {new Date(enrollment.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      ${enrollment.paymentAmount}
                    </p>
                    {enrollment.paymentProof && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewImage(enrollment.paymentProof!)}
                        icon={<FiEye />}
                      >
                        Ver Comprobante
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(enrollment)}
                    >
                      Gestionar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: Math.max(0, pagination.page - 1) })}
                  disabled={pagination.page === 0}
                >
                  Anterior
                </Button>
                <span className="py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
                  Página {pagination.page + 1} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages - 1, pagination.page + 1) })}
                  disabled={pagination.page === pagination.totalPages - 1}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <FiSearch className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No se encontraron inscripciones</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {statusFilter ? 'Prueba con otro filtro de estado' : 'No hay inscripciones registradas en el sistema'}
            </p>
          </div>
        )}
      </div>

      {/* Modal para gestionar inscripción */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, enrollment: null })}
        title="Gestionar Inscripción"
      >
        {detailModal.enrollment && (
          <div className="space-y-6">
            {/* Información de la inscripción */}
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 className="font-semibold text-lg mb-2">{detailModal.enrollment.class.subjectName}</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Estudiante:</span> {detailModal.enrollment.student.name} {detailModal.enrollment.student.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {detailModal.enrollment.student.email}
                  </p>
                  <p>
                    <span className="font-medium">Profesor:</span> {detailModal.enrollment.class.teacherName}
                  </p>
                  <p>
                    <span className="font-medium">Nivel:</span> {getLevelName(detailModal.enrollment.class.level)}
                  </p>
                  <p>
                    <span className="font-medium">Precio:</span> ${detailModal.enrollment.paymentAmount}
                  </p>
                  <p>
                    <span className="font-medium">Fecha de inscripción:</span> {new Date(detailModal.enrollment.createdAt).toLocaleDateString()}
                  </p>
                  {detailModal.enrollment.expiresAt && (
                    <p>
                      <span className="font-medium">Fecha límite de pago:</span> {new Date(detailModal.enrollment.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Comprobante de pago si existe */}
              {detailModal.enrollment.paymentProof && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <FiUpload className="mr-2" /> Comprobante de pago
                  </h4>
                  <div className="flex justify-center">
                    <div
                      className="relative w-full h-48 cursor-pointer border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                      onClick={() => handleViewImage(detailModal.enrollment!.paymentProof!)}
                    >
                      <Image
                        src={detailModal.enrollment.paymentProof}
                        alt="Comprobante de pago"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario para actualizar estado */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Actualizar estado
                  </label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2"
                  >
                    <option value="pending_payment">Pendiente de Pago</option>
                    <option value="proof_submitted">Comprobante Enviado</option>
                    <option value="enrolled">Inscrito</option>
                    <option value="proof_rejected">Comprobante Rechazado</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={updateForm.notes}
                    onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2"
                    rows={3}
                    placeholder="Añade notas o motivo de rechazo si es necesario"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDetailModal({ isOpen: false, enrollment: null })}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateStatus}
                isLoading={isUpdating}
              >
                Actualizar Estado
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para ver imagen ampliada */}
      <Modal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ isOpen: false, imageUrl: '' })}
        title="Comprobante de Pago"
      >
        <div className="flex justify-center">
          <div className="relative w-full h-96">
            {imageModal.imageUrl && (
              <Image
                src={imageModal.imageUrl}
                alt="Comprobante de pago"
                fill
                className="object-contain"
              />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
