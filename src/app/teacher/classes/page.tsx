'use client';
import { useState, useEffect } from 'react';
import { FetchData, SuccessMsj, ErrorMsj, getDayName, getLevelName } from '@/utils/Tools.tsx';
import { ClassFormValues, ClassFormSchema } from '@/validations/class';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Card, Input, Select, Button, DaysCheckboxGroup, NumericInput, SubjectSelect, CurrencyInput } from '@/components';
import { FiX, FiSave, FiBookOpen } from 'react-icons/fi';
import { Class } from '@/interfaces';

export default function TeacherClasses() {
  
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(ClassFormSchema),
    defaultValues: {
      subject: {},
      price: 0, 
      level: '', 
      selectedDays: [], 
      startTime: '', 
      endTime: '', 
      maxStudents: 30
    }
  });
  
  const { 
    handleSubmit, 
    formState: { errors }, 
    setValue,
    reset,
    control
  } = form;

  const [classes, setClasses] = useState<Class[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    const GetTeacherData = async () => {
      try {
        const data = await FetchData('/api/teacher/profile?needClasses=true', {}, 'GET');
        if (data) {
          setClasses(data.classes || []);
            if (data.subjects.length > 0) {
              setTeacherSubjects(data.subjects);
            }
          }
      } catch (error: any) {
        ErrorMsj(error.message || 'Error al obtener los datos del perfil');
      }
    };
    GetTeacherData();
  }, []);

  const handleDaysChange = (days: string[]) => {
    setValue('selectedDays', days, { shouldValidate: true });
  };

  const onSubmit = async (data: ClassFormValues) => {
    try {
      const response = await FetchData('/api/classes', {classData: data}, 'POST');
      if (response.success) {
        setClasses([...classes, response.classCreated]);
        SuccessMsj(response.message);
        reset();
      }
    } catch (error: any) {
      ErrorMsj(error.message || 'Error al crear la clase');
    }
  };

  const getTeacherSubjectOptions = () => {
    return teacherSubjects.map(subject => ({
      value: subject,
      label: subject.name
    }));
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Gestión de Clases</h1>

        <Card 
          title="Crear Nueva Clase" 
          icon={<FiBookOpen className="text-blue-500" />}
          className="mb-8"
          fullWidth = {true}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-12 gap-6">
              <div className="md:col-span-6">
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <SubjectSelect
                      {...field}
                      label="Materia"
                      error={errors.subject?.message}
                      options={[
                        { 
                          value: { _id: '', name: '' }, 
                          label: 'Seleccionar materia' 
                        },
                        ...getTeacherSubjectOptions()
                      ]}
                    />
                  )}
                />
              </div>

              <div className="grid md:col-span-6 md:grid-cols-2 gap-4">
                <div>
                  <Controller
                    name="level"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        id="level"
                        label="Nivel"
                        error={errors.level?.message}
                        options={[
                          { value: '', label: 'Seleccionar nivel' },
                          { value: '1', label: 'Principiante' },
                          { value: '2', label: 'Intermedio' },
                          { value: '3', label: 'Avanzado' }
                        ]}
                      />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        {...field}
                        id="price"
                        label="Precio"
                        error={errors.price?.message}
                        onChange={(value: number) => field.onChange(value)}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <DaysCheckboxGroup 
                  selectedDays={form.getValues('selectedDays')} 
                  onChange={handleDaysChange} 
                />
                {errors.selectedDays?.message && <p className="text-red-500 text-sm">{errors.selectedDays.message}</p>}
              </div>

              <div className="grid md:grid-cols-2 md:col-span-6 gap-4">
                <div>
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="startTime"
                        label="Hora de Inicio"
                        type="time"
                        error={errors.startTime?.message}
                        className="w-full"
                      />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="endTime"
                        label="Hora de Fin"
                        type="time"
                        error={errors.endTime?.message}
                        className="w-full"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Controller
                  name="maxStudents"
                  control={control}
                  render={({ field }) => (
                    <NumericInput
                      {...field}
                      id="maxStudents"
                      label="Límite de Estudiantes"
                      error={errors.maxStudents?.message}
                      className="w-full"
                      value={field.value}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                onClick={() => reset()}
                variant="outline"
                icon={<FiX />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<FiSave />}
              >
                Guardar Clase
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Clases Existentes" fullWidth = {true}>
          {classes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay clases registradas. Crea tu primera clase.
            </p>
          ) : (
            <div className="space-y-4">
              {classes.map((cls, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">
                      {cls.subjectName} {getLevelName(cls.level)}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Estudiantes ({cls.students.length}/{cls.maxStudents})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getDayName(cls.selectedDays)} • {cls.startTime} - {cls.endTime}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    Precio: ${cls.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}