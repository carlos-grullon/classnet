'use client';
import { useState } from 'react';

interface Class {
  id: string;
  name: string;
  price: number;
  level: string;
  dayOfWeek: string[];
  startTime: string;
  endTime: string;
  maxStudents: number;
}

export default function TeacherClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState<Omit<Class, 'id'>>({
    name: '',
    price: 0,
    level: '',
    dayOfWeek: [],
    startTime: '',
    endTime: '',
    maxStudents: 30
  });

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxStudents' || name === 'price' 
        ? parseInt(value, 10) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    
    try {
        // Envía los datos del formulario al servidor mediante una petición POST
        const response = await fetch('/api/classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData), // Convierte los datos del formulario a JSON
        });
        
        // Parsea la respuesta del servidor
        const data = await response.json();
        
        // Si la respuesta no es exitosa, lanza un error
        if (!response.ok) {
          throw new Error(data.error || 'Error al crear la clase');
        }
        
        // Crea un nuevo objeto de clase con el ID devuelto por el servidor
        const newClass = {
          ...formData,
          id: data.insertedId
        };
        // Añade la nueva clase al estado local
        setClasses(prev => [...prev, newClass]);
      } catch (error) {
        // Maneja cualquier error que ocurra durante el proceso
        console.error('Error al guardar la clase:', error);
      }
    }
    // Resetea el formulario a sus valores iniciales después de enviar
    setFormData({
      name: '',
      price: 0,
      level: '',
      dayOfWeek: [],
      startTime: '',
      endTime: '',
      maxStudents: 30
    });
  };

  const handleEdit = (classItem: Class) => {
    setFormData(classItem);
    setIsEditing(true);
    setEditingId(classItem.id);
  };

  const handleDelete = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Gestión de Clases</h1>

        {/* Formulario */}
        <div className="rounded-lg shadow-lg p-6 mb-8" style={{ background: 'var(--background-soft)' }}>
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Editar Clase' : 'Crear Nueva Clase'}
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
                  id="schedule.dayOfWeek"
                  name="schedule.dayOfWeek"
                  value={formData.schedule.dayOfWeek}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  style={{ background: 'var(--input-background)', color: 'var(--foreground)' }}
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="schedule.startTime" className="block text-sm font-medium mb-2">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    id="schedule.startTime"
                    name="schedule.startTime"
                    value={formData.schedule.startTime}
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
                    id="schedule.endTime"
                    name="schedule.endTime"
                    value={formData.schedule.endTime}
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
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      price: 0,
                      level: '',
                      schedule: {
                        dayOfWeek: 'Lunes',
                        startTime: '',
                        endTime: ''
                      },
                      maxStudents: 20
                    });
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEditing ? 'Guardar Cambios' : 'Crear Clase'}
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
                key={classItem.id}
                className="border rounded-lg p-4 flex items-center justify-between"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <h3 className="font-semibold">{classItem.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {classItem.level} • {classItem.schedule.dayOfWeek} {classItem.schedule.startTime}-{classItem.schedule.endTime}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Límite: {classItem.maxStudents} estudiantes
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(classItem)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(classItem.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Eliminar
                  </button>
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
