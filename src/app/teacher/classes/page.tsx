'use client';
import { useState } from 'react';
import { FetchData, SuccessMsj, ErrorMsj } from '@/utils/Tools.tsx';
import { Class } from '@/interfaces/Class';
import { ToastContainer } from 'react-toastify';
import { Card, Input, Select, Button } from '@/components';
import { FiPlus, FiX, FiSave, FiClock, FiDollarSign, FiUsers, FiBookOpen } from 'react-icons/fi';

export default function TeacherClasses() {
  const formInitialValues = {
    name: '', price: 0, level: '', dayOfWeek: '', startTime: '', endTime: '', maxStudents: 30
  };
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState(formInitialValues);

  const daysOfWeek = {
    '1': 'Lunes',
    '2': 'Martes',
    '3': 'Miércoles',
    '4': 'Jueves',
    '5': 'Viernes',
    '6': 'Sábado',
    '7': 'Domingo'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' || name === 'maxStudents' || name === 'price'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    try {
      await FetchData('/api/classes', formData, 'POST');
      SuccessMsj('¡Clase guardada con éxito!');
      setFormData(formInitialValues);
    } catch (error: any) {
      ErrorMsj('Error al guardar la clase. Por favor, inténtalo de nuevo.');
    }
  };

  const getDayName = (day: string) => {
    return daysOfWeek[day as keyof typeof daysOfWeek] || day;
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Gestión de Clases</h1>

        <Card 
          title="Crear Nueva Clase" 
          icon={<FiBookOpen className="text-blue-500" />}
          className="mb-8"
          fullWidth = {true}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  label="Nombre de la Clase"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Matemáticas Avanzadas"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    id="level"
                    name="level"
                    label="Nivel"
                    value={formData.level}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Seleccionar nivel' },
                      { value: '1', label: 'Principiante' },
                      { value: '2', label: 'Intermedio' },
                      { value: '3', label: 'Avanzado' }
                    ]}
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-2">
                    Precio
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <Select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  label="Día de la Semana"
                  value={formData.dayOfWeek}
                  onChange={handleInputChange}
                  options={[
                    { value: '', label: 'Seleccionar día' },
                    ...Object.entries(daysOfWeek).map(([key, value]) => ({
                      value: key,
                      label: value
                    }))
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium mb-2">
                    Hora de Inicio
                  </label>
                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium mb-2">
                    Hora de Fin
                  </label>
                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="maxStudents" className="block text-sm font-medium mb-2">
                  Límite de Estudiantes
                </label>
                <input
                  id="maxStudents"
                  name="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                onClick={() => setFormData(formInitialValues)}
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
                  <h3 className="font-semibold">{cls.name}</h3>
                  <p className="text-sm text-gray-600">
                    {getDayName(cls.dayOfWeek)} • {cls.startTime} - {cls.endTime}
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