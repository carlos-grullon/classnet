'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components';
import { FiClock, FiBookOpen, FiInfo, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { FetchData, ErrorMsj, getDayName, getLevelName } from '@/utils/Tools.tsx';
import { useRouter } from 'next/navigation';

// Interfaces para tipar los datos
export interface Class {
  _id: string;
  subjectName?: string;
  level?: string;
  startTime: string;
  endTime: string;
  selectedDays: string[];
  price?: number;
  currency?: string;
}

export default function MisClases() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await FetchData<{ success: boolean, classes: Class[] }>('/api/student/classes', {}, 'GET');
        if (response.success && response.classes) {
          setClasses(response.classes);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar las clases';
        ErrorMsj(message);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mis Clases</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <FiInfo className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tienes clases</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Aún no te has inscrito a ninguna clase.
          </p>
          <Button onClick={() => router.push('/student/searchclasses')}>
            Buscar Clases
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem._id} className="overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {classItem.subjectName} - {getLevelName(classItem.level || '')}
                  </h3>
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

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <FiDollarSign className="mr-2" />
                  <span>{classItem.price} {classItem.currency}</span>
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/student/classes/${classItem._id}/virtual-classroom`)}
                    className="flex items-center"
                  >
                    <FiBookOpen className="mr-2" />
                    Aula Virtual
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
