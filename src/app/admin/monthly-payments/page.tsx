'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from '@/components';
import { FiCheckCircle, FiXCircle, FiEye, FiCalendar, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { FetchData, ErrorMsj, SuccessMsj, getLevelName } from '@/utils/Tools.tsx';
import { formatDateLong, formatCurrency } from '@/utils/GeneralTools.ts';
import Image from 'next/image';

// Interfaz para la información de clases
interface ClassInfo {
  _id: string;
  name: string;
  level?: string;
  teacher_id?: string;
  teacherName?: string;
}

// Interfaz para los pagos mensuales pendientes
interface PendingPayment {
  paymentId: string;
  enrollmentId: string;
  classId: string;
  studentName: string;
  studentEmail: string;
  className: string;
  classLevel?: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentDueDate: string;
  proofUrl: string;
  notes: string;
  submittedAt: string;
}

export default function MonthlyPaymentsPage() {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [allPayments, setAllPayments] = useState<PendingPayment[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cargar datos de pagos mensuales pendientes
  useEffect(() => {
    fetchPendingPayments();
  }, []);

  // Filtrar pagos por clase seleccionada
  useEffect(() => {
    if (selectedClassId === 'all') {
      setPendingPayments(allPayments);
    } else {
      setPendingPayments(allPayments.filter(payment => payment.classId === selectedClassId));
    }
  }, [selectedClassId, allPayments]);

  const fetchPendingPayments = async () => {
    setIsLoading(true);
    try {
      const response = await FetchData('/api/admin/monthly-payments/pending', {}, 'GET');
      if (response && response.success) {
        setAllPayments(response.pendingPayments || []);
        console.log(response.pendingPayments);
        setPendingPayments(response.pendingPayments || []);
        setClasses(response.classes || []);
      } else {
        ErrorMsj('Error al cargar los pagos pendientes');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      ErrorMsj(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProof = (proofUrl: string) => {
    setSelectedPaymentProof(proofUrl);
    setIsImageModalOpen(true);
  };

  const handleReviewPayment = (payment: PendingPayment, action: 'approved' | 'rejected') => {
    setSelectedPayment(payment);
    setReviewAction(action);
    setReviewNotes('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedPayment || !reviewAction) return;

    setIsProcessing(true);
    try {
      const response = await FetchData(`/api/admin/enrollments/${selectedPayment.enrollmentId}/monthly-payment`, {
        paymentId: selectedPayment.paymentId,
        status: reviewAction,
        notes: reviewNotes
      }, 'PATCH');

      if (response && response.success) {
        SuccessMsj(`Pago ${reviewAction === 'approved' ? 'aprobado' : 'rechazado'} correctamente`);
        setIsReviewModalOpen(false);
        fetchPendingPayments(); // Recargar la lista de pagos pendientes
      } else {
        throw new Error(response?.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      ErrorMsj(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Pagos Mensuales</h1>
      
      {/* Filtros y acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FiFilter className="text-muted-foreground" />
          <select 
            className="border rounded-md p-2 flex-grow sm:flex-grow-0 min-w-[200px]"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="all">Todas las clases ({allPayments.length})</option>
            {classes.map((classItem) => {
              const count = allPayments.filter(payment => payment.classId === classItem._id).length;
              return (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.name} {classItem.level ? `- ${getLevelName(classItem.level)}` : ''} ({count})
                </option>
              );
            })}
          </select>
        </div>
        
        <div className="flex items-center gap-4">
          {selectedClassId !== 'all' && (
            <span className="text-sm text-muted-foreground">
              Mostrando {pendingPayments.length} de {allPayments.length} pagos pendientes
            </span>
          )}
          <Button 
            onClick={fetchPendingPayments} 
            variant="outline" 
            icon={<FiRefreshCw />}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : pendingPayments.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-lg">No hay pagos mensuales pendientes de revisión</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-2">
          {pendingPayments.map((payment) => (
            <Card key={payment.paymentId} fullWidth size="sm">
              <div className="grid md:grid-cols-12 gap-4">
                <div className="col-span-4">
                  <h2 className="text-xl font-semibold">
                    {payment.studentName !== 'undefined undefined' ? payment.studentName : 'Estudiante'}
                  </h2>
                  <p className="text-sm text-muted-foreground">{payment.studentEmail || 'Sin correo'}</p>
                  <p className="mt-2">
                    <span className="font-medium">Clase:</span> {payment.className || 'Sin nombre'} {payment.classLevel ? `(${getLevelName(payment.classLevel)})` : ''}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">Monto:</span> {formatCurrency(payment.amount, payment.currency)}
                  </p>
                  <div className="flex items-center mt-1">
                    <FiCalendar className="mr-1" />
                    <span className="font-medium">Fecha:</span> {formatDateLong(new Date(payment.paymentDate))}
                  </div>
                </div>
                <div className="col-span-8">
                <div className="flex justify-end mt-2">
                    <Button
                      onClick={() => handleViewProof(payment.proofUrl)}
                      variant="outline"
                      icon={<FiEye />}
                      className=""
                    >
                      Ver Comprobante
                    </Button>
                  </div>
                  <p className="mt-2">
                    <span className="font-medium">Notas del estudiante:</span> {payment.notes ? payment.notes : 'Sin notas'}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">Pago correspondiente a:</span> {payment.paymentDueDate}
                  </p>
                  <div className="flex justify-between mt-2 gap-2">
                    <Button
                      onClick={() => handleReviewPayment(payment, 'approved')}
                      variant="success"
                      icon={<FiCheckCircle />}
                      className="flex-1"
                    >
                      Aprobar
                    </Button>
                    <Button
                      onClick={() => handleReviewPayment(payment, 'rejected')}
                      variant="danger"
                      icon={<FiXCircle />}
                      className="flex-1"
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para ver imagen ampliada */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Comprobante de Pago"
        className="max-w-2xl"
      >
        <div className="relative h-96 w-full">
          <Image 
            src={selectedPaymentProof} 
            alt="Comprobante de pago" 
            fill 
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-contain"
          />
        </div>
      </Modal>

      {/* Modal para revisar pago */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => !isProcessing && setIsReviewModalOpen(false)}
        title={`${reviewAction === 'approved' ? 'Aprobar' : 'Rechazar'} Pago Mensual`}
      >
        <div className="space-y-4">
          {selectedPayment && (
            <>
              <p>
                <span className="font-medium">Estudiante:</span> {selectedPayment.studentName}
              </p>
              <p>
                <span className="font-medium">Clase:</span> {selectedPayment.className}
              </p>
              <p>
                <span className="font-medium">Monto:</span> {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
              </p>
              <p>
                <span className="font-medium">Fecha:</span> {formatDateLong(new Date(selectedPayment.paymentDate))}
              </p>
            </>
          )}

          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              {reviewAction === 'approved' ? 'Notas adicionales (opcional)' : 'Motivo del rechazo'}
            </label>
            <textarea
              id="notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder={reviewAction === 'approved' ? 'Notas adicionales...' : 'Motivo del rechazo...'}
              required={reviewAction === 'rejected'}
              disabled={isProcessing}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => !isProcessing && setIsReviewModalOpen(false)}
              variant="outline"
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitReview}
              variant={reviewAction === 'approved' ? 'success' : 'danger'}
              disabled={isProcessing || (reviewAction === 'rejected' && !reviewNotes.trim())}
              isLoading={isProcessing}
            >
              {reviewAction === 'approved' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
