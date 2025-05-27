'use client'
import React, { useState } from 'react';
import { InputReadOnly, Select, Card, Button, CurrencyInput, DaysCheckboxGroup, SubjectSearch, TeacherSearch } from '@/components';
import { ToastContainer } from 'react-toastify/unstyled';
import { FiFilter } from 'react-icons/fi';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchClassSchema, SearchClassValues } from '@/validations/classSearch';

export default function StudentClasses() {
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [isTeacherSearchOpen, setIsTeacherSearchOpen] = useState(false);
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [selectedTeacherName, setSelectedTeacherName] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
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

  const onSubmit = (data: SearchClassValues) => {
    console.log(data);
  };

  const handleReset = () => {
    reset();
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
      </div>
      <TeacherSearch
        isOpen={isTeacherSearchOpen}
        onClose={() => setIsTeacherSearchOpen(false)}
        onSelect={(teacher) => {
          setValue('teacher_id', teacher.id);
          setSelectedTeacherName(teacher.name);
          setIsTeacherSearchOpen(false);
        }}
      />
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
