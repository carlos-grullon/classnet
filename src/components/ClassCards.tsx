'use client';

import { Class } from '@/interfaces/Class';
import { useEffect, useState } from 'react';
import { Card, Button, Modal } from '@/components';
import { FiBookOpen, FiClock, FiCalendar, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { getDayName, getLevelName } from '@/utils/GeneralTools.ts';
import { FetchData, ErrorMsj } from '@/utils/Tools.tsx';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import { sendNotification } from '@/services/notificationService';

export default function ClassCards() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [classDetailsModal, setClassDetailsModal] = useState({
    isOpen: false,
    classItem: null as Class | null
  });
  const router = useRouter();

  const openClassDetails = (classItem: Class) => {
    setClassDetailsModal({
      isOpen: true,
      classItem
    });
  };

  const handlebuscarclases = () => {
    sendNotification({
              userId: '6879d2ece3b14292b11bccae',
              title: 'FUERZA con la notificacion',
              message: 'Si buenas tardes equipo, los amé',
              type: 'info',
              link: '',
              metadata: {}
            })
  }

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

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <Card fullWidth size='sm'>
        {classes.length > 0 ? <h2 className="text-xl font-semibold mb-4 text-center">Mis Clases</h2> : null}
        <div className="space-y-6">
          {classes.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {classes.map((classItem) => (
                <Card key={classItem._id} className="overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {classItem.subjectName} - {getLevelName(classItem.level || '')}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <FiCalendar className="mr-2" />
                      <span>{getDayName(classItem.selectedDays || [])}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <FiClock className="mr-2" />
                      <span>{classItem.startTime} - {classItem.endTime}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => openClassDetails(classItem)}
                      className="md:text-base text-sm"
                    >
                      Detalles
                    </Button>
                    {classItem.status === 'in_progress' ? (<Button
                      variant="primary"
                      onClick={() => router.push(`/student/classes/${classItem._id}/virtual-classroom`)}
                      className="flex items-center"
                    >
                      <FiBookOpen className="mr-2" />
                      Aula Virtual
                    </Button>) : (
                      <span className="text-orange-500 font-semibold flex items-center border border-orange-600 rounded-md p-2">
                        <FiClock className="mr-2 text-3xl" />
                        La clase aún no ha comenzado. ¡Pronto iniciaremos!
                      </span>
                    )}
                  </div>
                  {classItem.status !== 'in_progress' && (
                    <div className="mt-2">
                        <p className=" text-green-600 dark:text-green-400 flex items-center gap-2">
                          <FaWhatsapp className="text-xl" /> Link del grupo de whatsapp
                        </p>
                        <Link
                          href={classItem.whatsappLink || ''}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline break-all whitespace-normal"
                        >
                          {classItem.whatsappLink || ''}
                        </Link>
                      </div>
                    )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No tienes clases
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Aún no te has inscrito a ninguna clase.
              </p>
              <Button onClick={() => handlebuscarclases()}>
                Buscar Clases
              </Button>
            </div>
          )}
        </div>
        <Modal
          isOpen={classDetailsModal.isOpen}
          onClose={() => setClassDetailsModal({ isOpen: false, classItem: null })}
          title={`Detalles de ${classDetailsModal.classItem?.subjectName || 'la clase'}`}
        >
          {classDetailsModal.classItem && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 className="font-semibold text-lg mb-3">{classDetailsModal.classItem.subjectName}</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-blue-500" />
                    <span className="font-medium">Nivel:</span>
                    <span>{getLevelName(classDetailsModal.classItem.level)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiBookOpen className="text-blue-500" />
                    <span className="font-medium">Profesor:</span>
                    <span>{classDetailsModal.classItem.teacherName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-blue-500" />
                    <span className="font-medium">Días:</span>
                    <span>{getDayName(classDetailsModal.classItem.selectedDays || [])}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiClock className="text-blue-500" />
                    <span className="font-medium">Horario:</span>
                    <span>{classDetailsModal.classItem.startTime} - {classDetailsModal.classItem.endTime}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiDollarSign className="text-blue-500" />
                    <span className="font-medium">Precio:</span>
                    <span>${classDetailsModal.classItem.price} {classDetailsModal.classItem.currency}</span>
                  </div>

                  {classDetailsModal.classItem.durationWeeks && (
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-blue-500" />
                      <span className="font-medium">Duración:</span>
                      <span>{classDetailsModal.classItem.durationWeeks} semanas</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setClassDetailsModal({ isOpen: false, classItem: null })}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </>
  );
}
