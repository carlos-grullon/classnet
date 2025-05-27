'use client'
import React, { useState } from 'react';
import { InputReadOnly, Select, Card, Button, CurrencyInput, DaysCheckboxGroup, SubjectSearch, TeacherSearch } from '@/components';
import { ToastContainer } from 'react-toastify/unstyled';
import { FiFilter, FiCalendar } from 'react-icons/fi';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchClassSchema, SearchClassValues } from '@/validations/classSearch';
import { FetchData, getDayName, getLevelName } from '@/utils/Tools.tsx';
import { Class } from '@/interfaces/Class';

export default function StudentClasses() {
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [isTeacherSearchOpen, setIsTeacherSearchOpen] = useState(false);
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [selectedTeacherName, setSelectedTeacherName] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    total: 0,
    totalPages: 0
  });
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      subject: '',
      teacher_id: ''
    }
  });

  const fetchClasses = async (data: SearchClassValues, page: number = 0) => {
    setIsLoading(true);
    try {
      const response = await FetchData('/api/classes', { ...data, page });
      setClasses(response.classes);
      setPagination({
        page: response.page,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: SearchClassValues) => fetchClasses(data);

  const handleReset = () => {
    reset();
    setClasses([]);
    setPagination({ page: 0, total: 0, totalPages: 0 });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Búsqueda Clases</h1>
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
                  name="subject"
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
            {classes.length > 0  ? (
              <div className="mt-8 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {pagination.total} clases encontradas
                </h2>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {classes.map((classItem) => (
                    <Card key={classItem._id} className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-medium text-lg dark:text-white">
                          {classItem.subject} - {getLevelName(classItem.level)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Profesor/a: <span className='font-bold'>{classItem.teacher}</span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Días: <span className='font-bold'>{getDayName(classItem.selectedDays)}</span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Horario: <span className='font-bold'>{classItem.startTime} - {classItem.endTime}</span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Precio: <span className='font-bold'>${classItem.price}</span>
                        </p>
                        <div className="pt-2">
                          <Button size="sm" onClick={() => {/* Lógica de inscripción */ }}>
                            Inscribirse
                          </Button>
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
        onSelect={(subject) => {
          setValue('subject', subject.name);
          setSelectedSubjectName(subject.name);
          setSubjectModalOpen(false);
        }}
      />
    </div>
  );
}
