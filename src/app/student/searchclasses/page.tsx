'use client'
import React, { useState } from 'react';
import { InputReadOnly, Select, Card, Button, CurrencyInput, DaysCheckboxGroup, SubjectSearch, TeacherSearch, Modal } from '@/components'
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { FiFilter, FiCalendar, FiCheckCircle, FiDollarSign, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchClassSchema, SearchClassValues } from '@/validations/classSearch';
import { FetchData, getDayName, getLevelName, ErrorMsj, SuccessMsj } from '@/utils/Tools.tsx';
import { useRouter } from 'next/navigation';

interface SearchClassResult {
  _id: string;
  teacher_id: string;
  subjectName: string;
  teacherName: string;
  price: number;
  level: string;
  selectedDays: string[];
  startTime: string;
  endTime: string;
  // Agregar otros campos según sea necesario
}

export interface SearchClassesResponse {
  classes: SearchClassResult[];
  userHasTrial: boolean;
  total: number;
  page: number;
  totalPages: number;
}

interface ClassSearchPostResponse {
  success: boolean;
  message: string;
  enrollmentId: string;
  expiresAt: Date;
  error?: string;
}

export default function StudentClasses() {
  const router = useRouter();
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [isTeacherSearchOpen, setIsTeacherSearchOpen] = useState(false);
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [selectedTeacherName, setSelectedTeacherName] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    total: 0,
    totalPages: 0
  });
  const [trialModal, setTrialModal] = useState<{
    isOpen: boolean;
    classItem: SearchClassResult | null;
  }>({
    isOpen: false,
    classItem: null,
  });
  const [classes, setClasses] = useState<SearchClassResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [userHasTrial, setUserHasTrial] = useState(false);

  // Estado para el modal de confirmación de inscripción
  const [enrollmentModal, setEnrollmentModal] = useState({
    isOpen: false,
    classItem: null as SearchClassResult | null
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues
  } = useForm<SearchClassValues>({
    resolver: zodResolver(SearchClassSchema),
    defaultValues: {
      minPrice: 0,
      maxPrice: 0,
      days: [],
      level: '',
      subject_id: '',
      teacher_id: ''
    }
  });

  const fetchClasses = async (data: SearchClassValues, page: number = 0) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else if (value !== '' && value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      params.append('page', String(page));
      const response = await FetchData<SearchClassesResponse>(`/api/classes?${params}`, {}, 'GET');
      setClasses(response.classes);
      setUserHasTrial(response.userHasTrial);
      setPagination({
        page: response.page,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al buscar las clases';
      console.error(message, error)
      ErrorMsj('Error al buscar las clases');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: SearchClassValues) => {
    fetchClasses(data, 0); // Siempre empieza en página 0 al hacer submit
    setPagination(prev => ({ ...prev, page: 0 })); // Resetear estado de paginación
  };

  const handleReset = () => {
    reset();
    setClasses([]);
    setPagination({ page: 0, total: 0, totalPages: 0 });
  };

  const handleSubjectSelect = (subject: { _id: string; name: string }) => {
    setValue('subject_id', subject._id);
    setSelectedSubjectName(subject.name);
    setSubjectModalOpen(false);
  };

  // Manejador para abrir el modal de confirmación de inscripción
  const handleEnrollmentClick = (classItem: SearchClassResult) => {
    setEnrollmentModal({
      isOpen: true,
      classItem
    });
  };

  // Manejador para abrir el modal de confirmación de inscripción
  const handleTrialClick = (classItem: SearchClassResult) => {
    setTrialModal({
      isOpen: true,
      classItem
    });
  };

  const handleConfirmTrial = async () => {
    if (!trialModal.classItem) return;
    try {
      const response = await FetchData<ClassSearchPostResponse>('/api/student/trial', {
        classId: trialModal.classItem._id
      }, 'POST');

      if (response.success) {
        SuccessMsj('¡Clase de prueba agendada con éxito!');
        setTrialModal({ isOpen: false, classItem: null });
        router.push(`/student/enrollments/${response.enrollmentId}`);
      } else {
        ErrorMsj(response.error || 'Error al agendar la clase de prueba');
      }
    } catch (error) {
      console.error('Error scheduling trial:', error);
      ErrorMsj('Error al conectar con el servidor');
    } finally {
      setTrialModal({ isOpen: false, classItem: null });
    }
  };

  // Manejador para confirmar la inscripción
  const handleConfirmEnrollment = async () => {
    if (!enrollmentModal.classItem) return;

    setEnrollmentLoading(true);
    try {
      const response = await FetchData<ClassSearchPostResponse>('/api/student/enrollments', {
        classId: enrollmentModal.classItem._id
      }, 'POST');

      if (response.success) {
        SuccessMsj('Inscripción iniciada correctamente');
        setEnrollmentModal({ isOpen: false, classItem: null });
        // Redirigir a la página de detalles de inscripción
        router.push(`/student/enrollments/${response.enrollmentId}`);
      } else {
        // Si ya existe una inscripción, redirigir a ella
        if (response.enrollmentId) {
          SuccessMsj('Ya tienes una inscripción para esta clase');
          router.push(`/student/enrollments/${response.enrollmentId}`);
        } else {
          ErrorMsj(response.error || 'Error al procesar la inscripción');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al procesar la inscripción';
      ErrorMsj(message);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center md:text-left">Búsqueda Clases</h1>
        <Card
          title="Filtros de búsqueda"
          icon={<FiFilter className="text-blue-500" />}
          className="p-6"
          fullWidth
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className='grid md:grid-cols-12 gap-4'>
              {/* Teacher filter */}
              <div className="md:col-span-4">
                <Controller
                  name="teacher_id"
                  control={control}
                  render={({ field }) => (
                    <InputReadOnly
                      label="Profesor"
                      value={field.value ? `${selectedTeacherName}` : ''}
                      placeholder="Seleccionar profesor..."
                      onClick={() => setIsTeacherSearchOpen(true)}
                    />
                  )}
                />
              </div>

              {/* Subject filter */}
              <div className="md:col-span-4">
                <Controller
                  name="subject_id"
                  control={control}
                  render={({ field }) => (
                    <InputReadOnly
                      label="Materia"
                      value={field.value ? `${selectedSubjectName}` : ''}
                      placeholder="Seleccionar materia..."
                      onClick={() => setSubjectModalOpen(true)}
                    />
                  )}
                />
              </div>

              {/* Price filter */}
              <div className="md:col-span-4 grid grid-cols-2 gap-4">
                <Controller
                  name="minPrice"
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      {...field}
                      label="Precio mínimo"
                      placeholder="Desde"
                      value={field.value ?? 0}
                      error={errors.minPrice?.message}
                    />
                  )}
                />
                <Controller
                  name="maxPrice"
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      {...field}
                      label="Precio máximo"
                      placeholder="Hasta"
                      value={field.value ?? 0}
                      error={errors.maxPrice?.message}
                    />
                  )}
                />
              </div>
              <div className="md:col-span-2">
                {/* Level filter */}
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Nivel"
                      value={field.value || ''}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      options={[
                        { value: '', label: 'Todos' },
                        { value: '1', label: 'Principiante' },
                        { value: '2', label: 'Intermedio' },
                        { value: '3', label: 'Avanzado' }
                      ]}
                    />
                  )}
                />
              </div>
              <div className="md:col-span-7">
                <Controller
                  name="days"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-3">
                        Días de la semana <span className="text-xs dark:text-blue-300 text-blue-500">(si no selecciona ningun día, buscará por todos los días)</span>
                      </label>
                      <DaysCheckboxGroup
                        selectedDays={field.value || []}
                        onChange={field.onChange}
                      />
                      {errors.days && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.days?.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
              <div className="md:col-span-3 grid md:grid-cols-2 gap-3">
                <Button type="submit" className="mt-4 max-h-10" size='sm'>
                  Buscar Clases
                </Button>
                <Button type="button" className="mt-4 max-h-10" variant='danger' size="sm" onClick={handleReset}>
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700 dark:border-primary-400 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Buscando clases...</p>
          </div>
        ) : (
          <>
            {classes.length > 0 && (
              <div className="flex items-center justify-center gap-10 mt-4">
                <Button
                  disabled={pagination.page === 0 || isLoading}
                  onClick={() => fetchClasses(getValues(), pagination.page - 1)}
                >
                  Anterior
                </Button>

                <span>
                  Página {pagination.page + 1} de {pagination.totalPages}
                </span>

                <Button
                  disabled={pagination.page >= pagination.totalPages - 1 || isLoading}
                  onClick={() => fetchClasses(getValues(), pagination.page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
            {classes.length > 0 ? (
              <div className="mt-8 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {pagination.total} clases encontradas
                </h2>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {classes.map((classItem) => (
                    <Card key={classItem._id} className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-medium text-lg dark:text-white">
                          {classItem.subjectName} - {getLevelName(classItem.level)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Profesor/a: <span className='font-bold'>{classItem.teacherName}</span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Días: <span className='font-bold'>{getDayName(classItem.selectedDays!)}</span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Horario: <span className='font-bold'>{classItem.startTime} - {classItem.endTime}</span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Precio: <span className='font-bold'>${classItem.price}</span>
                        </p>
                        <div className="pt-2 flex justify-between">
                          <Button
                            size="sm"
                            onClick={() => handleEnrollmentClick(classItem)}
                            isLoading={enrollmentLoading && enrollmentModal.classItem?._id === classItem._id}
                          >
                            Inscribirse
                          </Button>
                          {userHasTrial && (
                            <Button
                              size="sm"
                              variant='success'
                              className='ml-2'
                              onClick={() => handleTrialClick(classItem)}
                              isLoading={enrollmentLoading && enrollmentModal.classItem?._id === classItem._id}
                            >
                              Iniciar prueba gratuita
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <FiCalendar className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay clases disponibles</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No se encontraron clases con los filtros seleccionados.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      {/* Teacher Search Modal */}
      <TeacherSearch
        isOpen={isTeacherSearchOpen}
        onClose={() => setIsTeacherSearchOpen(false)}
        onSelect={(teacher) => {
          setValue('teacher_id', teacher.id);
          setSelectedTeacherName(teacher.name);
          setIsTeacherSearchOpen(false);
        }}
      />
      {/* Subject Search Modal */}
      <SubjectSearch
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        onSelect={handleSubjectSelect}
      />

      {/* Modal de confirmación de inscripción */}
      <Modal
        isOpen={enrollmentModal.isOpen}
        onClose={() => setEnrollmentModal({ isOpen: false, classItem: null })}
        title="Confirmar Inscripción"
      >
        {enrollmentModal.classItem && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <h3 className="font-semibold text-lg mb-2">{enrollmentModal.classItem.subjectName}</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <FiCheckCircle className="text-blue-500" />
                  <span className="font-medium">Nivel:</span> {getLevelName(enrollmentModal.classItem.level)}
                </p>
                <p className="flex items-center gap-2">
                  <FiCheckCircle className="text-blue-500" />
                  <span className="font-medium">Profesor:</span> {enrollmentModal.classItem.teacherName}
                </p>
                <p className="flex items-center gap-2">
                  <FiCheckCircle className="text-blue-500" />
                  <span className="font-medium">Días:</span> {getDayName(enrollmentModal.classItem.selectedDays!)}
                </p>
                <p className="flex items-center gap-2">
                  <FiClock className="text-blue-500" />
                  <span className="font-medium">Horario:</span> {enrollmentModal.classItem.startTime} - {enrollmentModal.classItem.endTime}
                </p>
                <p className="flex items-center gap-2">
                  <FiDollarSign className="text-blue-500" />
                  <span className="font-medium">Precio:</span> ${enrollmentModal.classItem.price}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Al confirmar, se creará una inscripción pendiente de pago. Tendrás 48 horas para realizar el pago y subir el comprobante.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setEnrollmentModal({ isOpen: false, classItem: null })}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmEnrollment}
                isLoading={enrollmentLoading}
              >
                Confirmar Inscripción
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmationModal
        isOpen={trialModal.isOpen}
        onClose={() => setTrialModal({ isOpen: false, classItem: null })}
        onConfirm={handleConfirmTrial}
        title="Confirmar clase de prueba"
        message={
          trialModal.classItem && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border-2 border-green-200 dark:border-green-800/50 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-black dark:text-green-200 text-base flex items-center gap-2 text-center justify-center">
                      <FiCheckCircle className="text-green-500" />
                      Prueba Gratuita de 7 Días
                    </h4>
                    <ul className="text-sm space-y-1.5 list-disc list-inside">
                      <li>Acceso completo a la clase en vivo durante 7 días</li>
                      <li>Experiencia real con clases dinámicas y tareas semanales</li>
                      <li>Acompañamiento personalizado de tu profesor</li>
                      <li>Sin compromiso de permanencia</li>
                    </ul>
                    <p className="text-sm text-black/90 dark:text-white/90 mt-2 font-medium">
                      Al finalizar, podrás inscribirte fácilmente si deseas continuar.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 className="font-semibold text-lg mb-2">{trialModal.classItem.subjectName}</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <FiCheckCircle className="text-blue-500" />
                    <span className="font-medium">Nivel:</span> {getLevelName(trialModal.classItem.level)}
                  </p>
                  <p className="flex items-center gap-2">
                    <FiCheckCircle className="text-blue-500" />
                    <span className="font-medium">Profesor:</span> {trialModal.classItem.teacherName}
                  </p>
                  <p className="flex items-center gap-2">
                    <FiCheckCircle className="text-blue-500" />
                    <span className="font-medium">Días:</span> {getDayName(trialModal.classItem.selectedDays!)}
                  </p>
                  <p className="flex items-center gap-2">
                    <FiClock className="text-blue-500" />
                    <span className="font-medium">Horario:</span> {trialModal.classItem.startTime} - {trialModal.classItem.endTime}
                  </p>
                  <p className="flex items-center gap-2">
                    <FiDollarSign className="text-blue-500" />
                    <span className="font-medium">Precio:</span> ${trialModal.classItem.price}
                  </p>
                </div>
              </div>
            </div>
          )
        }
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="primary"
      />
    </div>
  );
}
