'use client';
import { useState } from 'react';
import { FetchData, SuccessMsj, ErrorMsj } from '@/utils/Tools.tsx'
import { Class } from '@/interfaces/Class';
import { ToastContainer } from 'react-toastify';

export default function TeacherClasses() {
  const formInitialValues = {
    name: '', price: 0, level: '', dayOfWeek: '', startTime: '', endTime: '', maxStudents: 30
  };
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState<Omit<Class, 'id'>>(formInitialValues);

  function ClearForm() {
    setFormData(formInitialValues);
  }

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
    const { name, value } = e.target;
    // Esto actualiza el estado de los campos del formulario
    setFormData(prev => ({
      ...prev,
      // Si el campo es maxStudents o price, lo convierte a número
      [name]: name === 'maxStudents' || name === 'price' 
        ? parseInt(value, 10) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    try {
        await FetchData('/api/classes', formData, 'POST');
        SuccessMsj('¡Clase guardada con éxito!');
        ClearForm();
    } catch (error) {
        ErrorMsj('Error al guardar la clase. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <ToastContainer />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Gestión de Clases</h1>

        {/* Formulario */}
        <div className="rounded-lg shadow-lg p-6 mb-8" style={{ background: 'var(--background-soft)' }}>
          <h2 className="text-xl font-semibold mb-4">
            Crear Nueva Clase
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre de la clase */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nombre de la Clase
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-md"
                  style={{ background: 'var(--input-background)', color: 'var(--foreground)' }}
                />
              </div>

              {/* Nivel */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label htmlFor="level" className="block text-sm font-medium mb-2">
                    Nivel
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                    style={{ background: 'var(--input-background)', color: 'var(--foreground)' }}
                  >
                    <option value="0">Seleccionar nivel</option>
                    <option value="1">Principiante</option>
                    <option value="2">Intermedio</option>
                    <option value="3">Avanzado</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-2">
                    Precio
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                    style={{ background: 'var(--input-background)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>

              {/* Día de la semana */}
              <div>
                <label htmlFor="schedule.dayOfWeek" className="block text-sm font-medium mb-2">
                  Día de la Semana
                </label>
                <select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  style={{ background: 'var(--input-background)', color: 'var(--foreground)' }}
                >
                  <option value="0">Seleccionar día</option>
                  {Object.entries(daysOfWeek).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium mb-2">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                    style={{ background: 'var(--input-background)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label htmlFor="schedule.endTime" className="block text-sm font-medium mb-2">
                    Hora de Fin
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                    style={{ background: 'var(--input-background)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>

              {/* Límite de estudiantes */}
              <div>
                <label htmlFor="maxStudents" className="block text-sm font-medium mb-2">
                  Límite de Estudiantes
                </label>
                <input
                  type="number"
                  id="maxStudents"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full p-2 border rounded-md"
                  style={{ background: 'var(--input-background)', color: 'var(--foreground)' }}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      price: 0,
                      level: '',
                      dayOfWeek: '',
                      startTime: '',
                      endTime: '',
                      maxStudents: 20
                    });
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Crear Clase
              </button>
            </div>
          </form>
        </div>

        {/* Lista de clases */}
        <div className="rounded-lg shadow-lg p-6" style={{ background: 'var(--background-soft)' }}>
          <h2 className="text-xl font-semibold mb-4">Clases Existentes</h2>
          <div className="space-y-4">
            {classes.map(classItem => (
              <div
                key={classItem.name}
                className="border rounded-lg p-4 flex items-center justify-between"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <h3 className="font-semibold">{classItem.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {classItem.level} • {classItem.dayOfWeek} {classItem.startTime}-{classItem.endTime}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Límite: {classItem.maxStudents} estudiantes
                  </p>
                </div>
              </div>
            ))}
            {classes.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No hay clases creadas aún
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}