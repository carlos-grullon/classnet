'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Badge } from '@/components';
import { FiClock, FiBookOpen, FiUsers, FiFilter, FiPlay, FiInfo, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { FetchData, ErrorMsj, SuccessMsj, getDayName, getLevelName } from '@/utils/Tools.tsx';
import { useRouter } from 'next/navigation';
import { ObjectId } from 'mongodb';

// Interfaces para tipar los datos
export interface Class {
  _id: string;
  subjectName?: string;
  level?: string;
  teacherName?: string;
  startTime: string;
  endTime: string;
  selectedDays: string[];
  maxStudents?: number;
  price?: number;
  status?: 'ready_to_start' | 'in_progress' | 'completed' | 'cancelled';
  students_enrolled: number;
  currency?: string;
  paymentFrequency?: string;
  paymentDay?: number;
}

interface Student {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

interface TeacherProfileResponse {
  name: string;
  image: string;
  description: string;
  subjects: string[];
  country: string;
  classes?: {
    _id: ObjectId;
    startTime: string;
    endTime: string;
    selectedDays: string[];
    students_enrolled: number;
  }[];
}

interface StudentResponse {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

interface APIResponse {
  students: StudentResponse[];
  error?: string;
}

// Helper function to convert API response to Class
export function toClass(item: { _id: ObjectId; startTime: string; endTime: string; selectedDays: string[]; students_enrolled: number }): Class {
  return {
    _id: item._id.toString(),
    startTime: item.startTime,
    endTime: item.endTime,
    selectedDays: item.selectedDays,
    students_enrolled: item.students_enrolled,
    // Default values for optional fields
    subjectName: '',
    level: '',
    teacherName: '',
    maxStudents: 0,
    price: 0,
    status: 'ready_to_start',
    currency: 'DOP',
    paymentFrequency: 'monthly',
    paymentDay: 1
  };
}

export default function MisClases() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [startingClass, setStartingClass] = useState(false);
  const [startClassId, setStartClassId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const filteredClasses = classes?.filter(cls =>
    statusFilter === 'all' || cls.status === statusFilter
  ) || [];

  // Función para obtener las clases del profesor
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await FetchData<TeacherProfileResponse>('/api/teacher/profile?needClasses=true', {}, 'GET');
      if (response.classes) {
        setClasses(response.classes.map(toClass));
      }
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar las clases';
      setError(message);
      ErrorMsj(message);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener los estudiantes de una clase
  const fetchClassStudents = async (classId: string) => {
    try {
      const response = await FetchData<APIResponse>(`/api/teacher/classes/${classId}/students`, {}, 'GET');
      if (response.students) {
        setClassStudents(response.students);
      }
      return response.students || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar los estudiantes';
      ErrorMsj(message);
      return [];
    }
  };

  // Función para iniciar una clase
  const startClass = async (classId: string) => {
    setStartingClass(true);
    setStartClassId(classId);

    try {
      const response = await FetchData<{ success: boolean}>(`/api/teacher/classes/${classId}/start`, {}, 'POST');
      if (response.success) {
        SuccessMsj('Clase iniciada correctamente');
        fetchClasses(); // Recargar las clases para actualizar el estado
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar la clase';
      ErrorMsj(message);
    } finally {
      setStartingClass(false);
      setStartClassId(null);
      setShowConfirmModal(false);
    }
  };

  // Cargar las clases al montar el componente
  useEffect(() => {
    fetchClasses();
  }, []);

  // Función para mostrar los detalles de los estudiantes
  const showStudents = async (classItem: Class) => {
    setSelectedClass(classItem);
    await fetchClassStudents(classItem._id);
    setShowStudentsModal(true);
  };

  // Función para confirmar el inicio de una clase
  const confirmStartClass = (classId: string) => {
    setStartClassId(classId);
    setShowConfirmModal(true);
  };

  // Función para obtener el color de la insignia según el estado
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ready_to_start': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del estado en español
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready_to_start': return 'Lista para iniciar';
      case 'in_progress': return 'En progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mis Clases</h1>

        {/* Filtro de estado */}
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-600 dark:text-gray-300" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="ready_to_start">Listas para iniciar</option>
            <option value="in_progress">En progreso</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No tienes clases {statusFilter !== 'all' ? `con estado "${getStatusText(statusFilter)}"` : ''}.
                {statusFilter !== 'all' ? (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="font-medium underline ml-1 focus:outline-none"
                  >
                    Ver todas las clases
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/teacher/classes/create')}
                    className="font-medium underline ml-1 focus:outline-none"
                  >
                    Crear una nueva clase
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <Card key={classItem._id} className="overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {classItem.subjectName}
                  </h3>
                  <Badge className={getStatusBadgeColor(classItem.status || '') }>
                    {getStatusText(classItem.status || '')}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <span className="font-medium">Nivel:</span> {getLevelName(classItem.level || '')}
                </p>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <FiCalendar className="mr-2" />
                  <span>
                    {getDayName(classItem.selectedDays)}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <FiClock className="mr-2" />
                  <span>{classItem.startTime} - {classItem.endTime}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <FiUsers className="mr-2" />
                  <span>{classItem.students_enrolled}/{classItem.maxStudents} estudiantes</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <FiDollarSign className="mr-2" />
                  <span>{classItem.price} {classItem.currency}</span>
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => showStudents(classItem)}
                    className="flex items-center"
                  >
                    <FiUsers className="mr-2" />
                    Estudiantes
                  </Button>

                  {classItem.status === 'ready_to_start' && (
                    <Button
                      onClick={() => confirmStartClass(classItem._id)}
                      className="flex items-center bg-green-500 hover:bg-green-600 text-white"
                      disabled={startingClass && startClassId === classItem._id}
                    >
                      {startingClass && startClassId === classItem._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Iniciando...
                        </>
                      ) : (
                        <>
                          <FiPlay className="mr-2" />
                          Iniciar Clase
                        </>
                      )}
                    </Button>
                  )}

                  {classItem.status === 'in_progress' && (
                    <Button
                      variant="primary"
                      onClick={() => router.push(`/teacher/classes/${classItem._id}/virtual-classroom`)}
                      className="flex items-center"
                    >
                      <FiBookOpen className="mr-2" />
                      Aula Virtual
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para mostrar los estudiantes */}
      {selectedClass && (
        <Modal
          isOpen={showStudentsModal}
          onClose={() => setShowStudentsModal(false)}
          title={`Estudiantes de ${selectedClass.subjectName}`}
        >
          <div className="p-4">
            {classStudents.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center py-4">
                No hay estudiantes inscritos en esta clase.
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {classStudents.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3">
                      {student.profilePicture ? (
                        <img
                          src={student.profilePicture}
                          alt={student.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                          {student.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{student.username}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal de confirmación para iniciar clase */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar inicio de clase"
      >
        <div className="p-4">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            ¿Estás seguro de que deseas iniciar esta clase? Esta acción no se puede deshacer y activará el sistema de pagos mensuales para todos los estudiantes inscritos.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => startClassId && startClass(startClassId)}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={startingClass}
            >
              {startingClass ? 'Iniciando...' : 'Iniciar Clase'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
