'use client';

import { useState, useEffect } from 'react';
import { Tabs, Tab, TabContent } from '@/components/ui/Tabs';
import { Button, Modal } from '@/components';
import { FiDownload, FiAlertCircle, FiUser, FiMail, FiBookOpen, FiAward, FiClock, FiDollarSign, FiExternalLink, FiVideo, FiEdit, FiLink } from 'react-icons/fi';
import { FetchData, ErrorMsj, getFileIcon } from '@/utils/Tools.tsx';
import { Select, SelectItem } from '@/components/ui/Select';
import { Input } from '@/components';
import { useCountries } from '@/providers';
import { FaWhatsapp } from 'react-icons/fa';
import { formatInputDateToLong, parseInputDate } from '@/utils/GeneralTools';
import Link from 'next/link';
import { ClassContent } from '@/interfaces/VirtualClassroom';
import { VirtualClassroomSkeleton } from '@/components/skeletons/VirtualClassroomSkeleton';
import { differenceInDays, isAfter } from 'date-fns';
import { FileUploader } from '@/components/FileUploader';
import { AudioRecorder } from '@/components/AudioRecorder';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Textarea } from '@/components/Textarea';
import { FiInfo, FiUpload, FiMic, FiMessageSquare } from 'react-icons/fi';
import { useParams } from 'next/navigation';
import { WeekContent } from '@/interfaces/VirtualClassroom';

interface StudentAssignment {
  fileUrl: string | null;
  fileName: string | null;
  audioUrl: string | null;
  message: string;
}

interface TeacherInfo {
  name: string;
  country: string;
  whatsapp: string;
  email: string;
  photo: string;
}

interface ClassInfo {
  name: string;
  level: string;
  selectedDays: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface ClassContentResponse {
  _id: string;
  classId: string;
  teacher: TeacherInfo;
  class: ClassInfo;
  welcomeMessage?: string;
  whatsappLink?: string;
  resources?: SupportMaterial[];
  durationWeeks: number;
}

export interface ClassContentApiResponse {
  success: boolean;
  data: ClassContentResponse;
}

interface SupportMaterial {
  id: string;
  description: string;
  link: string;
  fileName?: string;
}

export default function VirtualClassroom() {
  const params = useParams();
  const classId = params?.id as string;
  const { getCountryByCode } = useCountries();
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [content, setContent] = useState<ClassContent | null>(null);
  const [weekContent, setWeekContent] = useState<WeekContent>({
    meetingLink: '',
    recordingLink: '',
    supportMaterials: [],
    assignment: null
  });
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const getTimeRemainingMessage = (dueDate: string | Date, submittedAt?: string | Date) => {
    const now = new Date();
    const due = dueDate instanceof Date ? dueDate : parseInputDate(dueDate);

    // Normalize dates to midnight for accurate day difference calculation
    const normalizedNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const normalizedDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    if (submittedAt) {
      const submitted = submittedAt instanceof Date ? submittedAt : parseInputDate(submittedAt);
      const normalizedSubmitted = new Date(submitted.getFullYear(), submitted.getMonth(), submitted.getDate());

      if (isAfter(normalizedSubmitted, normalizedDue)) {
        const daysLate = differenceInDays(normalizedSubmitted, normalizedDue);
        return {
          message: `Asignación enviada ${daysLate} días tarde`,
          color: 'text-red-600 dark:text-red-400'
        };
      } else {
        const daysBefore = differenceInDays(normalizedDue, normalizedSubmitted);
        return {
          message: `Asignación enviada ${daysBefore} días antes`,
          color: 'text-green-600 dark:text-green-400'
        };
      }
    }

    if (isAfter(normalizedNow, normalizedDue)) {
      const daysLate = differenceInDays(normalizedNow, normalizedDue);
      return {
        message: `¡Fecha límite pasada por ${daysLate} días!`,
        color: 'text-red-600 dark:text-red-400'
      };
    }

    const daysRemaining = differenceInDays(normalizedDue, normalizedNow);

    if (daysRemaining > 3) {
      return {
        message: `${daysRemaining} días restantes para la entrega`,
        color: 'text-yellow-700 dark:text-yellow-400'
      };
    } else {
      return {
        message: `${daysRemaining} días restantes para la entrega`,
        color: 'text-red-600 dark:text-red-400'
      };
    }
  };

  // Cargar contenido inicial
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const data = await FetchData<ClassContentApiResponse>(`/api/teacher/classes/${classId}/content`, {}, 'GET');
        if (data.success && data.data) {
          setContent(
            {
              _id: data.data._id,
              classId: data.data.classId,
              teacher: data.data.teacher,
              class: data.data.class,
              welcomeMessage: data.data.welcomeMessage || '',
              whatsappLink: data.data.whatsappLink || '',
              resources: data.data.resources || [],
              durationWeeks: data.data.durationWeeks
            }
          );
        }
      } catch (error) {
        ErrorMsj('Error cargando contenido');
        console.error('Error loading content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [classId]);

  useEffect(() => {
    const fetchWeekContent = async () => {
      try {
        const response = await FetchData<{ success: boolean, data: WeekContent }>(
          `/api/teacher/classes/${classId}/week?week=${selectedWeek}`,
          {},
          'GET'
        );
        if (response.success && response.data) {
          setWeekContent(response.data);
          console.log(response);
        }
      } catch (error) {
        console.error('Error loading week content:', error);
      }
    };

    fetchWeekContent();
  }, [classId, selectedWeek]);

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(parseInt(e.target.value));
  };

  const [studentAssignment, setStudentAssignment] = useState<StudentAssignment>({
    fileUrl: null,
    fileName: null,
    audioUrl: null,
    message: ''
  });

  const handleFileChange = ({ url, fileName }: { url: string; fileName: string }) => {
    setStudentAssignment(prev => ({
      ...prev,
      fileUrl: url,
      fileName: fileName
    }));
  };

  const handleAudioRecordingComplete = (audioUrl: string) => {
    setStudentAssignment(prev => ({ ...prev, audioUrl }));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStudentAssignment(prev => ({ ...prev, message: e.target.value }));
  };

  const handleFileUpload = async () => {
    console.log(studentAssignment);
    // if (!studentAssignment.fileUrl) return;

    // try {
    //   const response = await fetch(`/api/student/classes/${classId}/assignments/${weekContent.assignment?.id}/submit`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       fileUrl: studentAssignment.fileUrl,
    //       audioUrl: weekContent.assignment?.hasAudio ? studentAssignment.audioUrl : null,
    //       message: studentAssignment.message
    //     })
    //   });

    //   const data = await response.json();

    //   if (response.ok) {
    //     SuccessMsj('Asignación enviada correctamente');
    //     setIsAssignmentModalOpen(false);
    //     setStudentAssignment({ fileUrl: null, audioUrl: null, message: '' });
    //   } else {
    //     throw new Error(data.error || 'Error al subir la asignación');
    //   }
    // } catch (error: any) {
    //   ErrorMsj(error.message);
    // }
  };

  if (isLoading || !content) {
    return <VirtualClassroomSkeleton />;
  }

  return (
    <div className="p-4 mx-7">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Aula Virtual</h1>
      </div>

      <Tabs defaultActiveId="presentation">
        {(activeId, setActiveId) => (
          <>
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <Tab
                id="presentation"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-4 py-2 font-medium text-sm focus:outline-none"
              >
                Presentación
              </Tab>
              <Tab
                id="week"
                activeId={activeId}
                setActiveId={setActiveId}
                className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeId === 'week' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <div className="relative flex items-center">
                  <span
                    className="mr-7 cursor-pointer"
                    onClick={() => setActiveId('week')}
                  >
                    Semana {selectedWeek}
                  </span>
                  <Select
                    value={selectedWeek.toString()}
                    onChange={handleWeekChange}
                    className="w-5 opacity-0 absolute right-0"
                  >
                    {Array.from({ length: content.durationWeeks }, (_, i) => i + 1).map(week => (
                      <SelectItem key={week} value={week.toString()}>
                        Semana {week}
                      </SelectItem>
                    ))}
                  </Select>
                  <div className="pointer-events-none absolute right-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </Tab>
              <Tab
                id="resources"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-4 py-2 font-medium text-sm focus:outline-none"
              >
                Recursos
              </Tab>
            </div>

            <TabContent id="presentation" activeId={activeId} className="mt-4">
              <div className="grid md:grid-cols-12 gap-6">

                {/* Teacher Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 md:col-span-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                    Profesor
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={content.teacher.photo}
                        alt={content.teacher.name}
                        className="w-32 h-32 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <FiUser className="text-blue-500" /> {content.teacher.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <span className="text-2xl">
                            {getCountryByCode(content.teacher.country)?.flag}
                          </span>
                          {getCountryByCode(content.teacher.country)?.name.common}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="col-span-5">
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FaWhatsapp className="text-green-500" /> WhatsApp - Número
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">{content.teacher.whatsapp}</p>
                        </div>
                        <div className="col-span-7">
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiMail className="text-blue-500" /> Email
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">{content.teacher.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Class Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 md:col-span-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                    Información del Curso
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <FiBookOpen className="text-blue-500" /> {content.class.name} - {content.class.level}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiAward className="text-blue-500" /> Nivel
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">{content.class.level}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiClock className="text-blue-500" /> Horario
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            {content.class.selectedDays} de {content.class.startTime} a {content.class.endTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <FiInfo /> Detalles
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiDollarSign className="text-blue-500" /> Costo mensual
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">${content.class.price}</p>
                        </div>
                        <div className="items-center gap-2 mb-4">
                          <p className=" text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <FaWhatsapp className="text-green-500 text-xl" /> Link del grupo de whatsapp
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 break-all whitespace-normal overflow-hidden">
                            {content.whatsappLink || 'Aún no se ha agregado un Link'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Welcome Message */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 md:col-span-12">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Mensaje de Bienvenida
                    </h2>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {content.welcomeMessage || 'Aún no se ha agregado un mensaje de bienvenida'}
                  </p>
                </div>
              </div>
            </TabContent>

            <TabContent id="week" activeId={activeId} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sección Reunión */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <FiVideo className="text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Reunión Semana {selectedWeek}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="font-medium text-center flex items-center justify-center gap-2">
                      <span>Link de la reunión:</span>
                    </div>
                    {weekContent?.meetingLink ? (
                      <div className="flex justify-center">
                        <Link 
                          href={weekContent.meetingLink} 
                          target="_blank"
                          className="flex justify-center items-center gap-2 text-blue-500 hover:underline"
                        >
                          <FiExternalLink />
                          {weekContent.meetingLink}
                        </Link>
                      </div>
                    ) : (
                      <div className="flex justify-center text-center items-center gap-2 bg-gray-200 dark:bg-gray-700 p-2 rounded w-fit mx-auto">
                        <FiAlertCircle className="text-red-600 dark:text-red-400" />
                        <p className="text-gray-500 dark:text-gray-400">No se ha agregado un link de reunión</p>
                      </div>
                    )}
                    <div className="font-medium text-center flex items-center justify-center gap-2 mt-4">
                      <span>Link de la grabación:</span>
                    </div>
                    {weekContent?.recordingLink ? (
                      <div className="flex justify-center">
                        <Link 
                          href={weekContent.recordingLink} 
                          target="_blank"
                          className="flex justify-center items-center gap-2 text-blue-500 hover:underline"
                        >
                          <FiExternalLink />
                          {weekContent.recordingLink}
                        </Link>
                      </div>
                    ) : (
                      <div className="flex justify-center text-center items-center gap-2 bg-gray-200 dark:bg-gray-700 p-2 rounded w-fit mx-auto">
                        <FiAlertCircle className="text-red-600 dark:text-red-400" />
                        <p className="text-gray-500 dark:text-gray-400">No se ha agregado un link de grabación</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-3 mt-4">
                      <div className="flex items-center gap-2">
                        <FiBookOpen className="text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Material de apoyo</h3>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {weekContent?.supportMaterials?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                          <FiAlertCircle className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Nada por aquí...</span>
                        </div>
                      ) : (
                        weekContent?.supportMaterials?.map(material => (
                          <div key={material.id} className="flex items-center justify-between p-2 bg-gray-200 dark:bg-gray-700 rounded">
                            <div className="flex items-center gap-2">
                              {getFileIcon(material.link)}
                              <div>
                                <p className="font-medium">{material.description}</p>
                                {material.fileName && (
                                  <Link href={material.link} target="_blank" className="text-blue-500 hover:underline">
                                    {material.fileName}
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                {/* Sección Asignación */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <FiEdit className="text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Asignación de la semana {selectedWeek}</h3>
                  </div>
                  {weekContent?.assignment ? (
                    <div className="space-y-2">
                      <div className="grid md:grid-cols-12 gap-2">
                        <div className="flex flex-col gap-1 md:col-span-5">
                          <span className="text-sm text-gray-500 dark:text-gray-300">Fecha de Entrega:</span>
                          <span className="font-semibold">
                            {formatInputDateToLong(weekContent?.assignment?.dueDate)}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 md:col-span-7">
                          <span className="text-sm text-gray-500 dark:text-gray-300 text-center">Estado:</span>
                          <span className={`bg-gray-200 dark:bg-gray-700 p-1 rounded font-semibold text-center ${getTimeRemainingMessage(weekContent?.assignment?.dueDate).color}`}>
                            {getTimeRemainingMessage(weekContent?.assignment?.dueDate).message}
                          </span>
                        </div>
                      </div>
                      {weekContent?.assignment?.fileLink && (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-500 dark:text-gray-300">Archivo:</span>
                          <span className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 p-2 rounded">
                            {getFileIcon(weekContent?.assignment?.fileName)}
                            <Link
                              href={weekContent?.assignment?.fileLink}
                              target="_blank"
                              className="text-blue-500 hover:underline"
                            >
                              {weekContent?.assignment?.fileName}
                            </Link>
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={weekContent?.assignment?.hasAudio}
                          readOnly
                          className="rounded text-blue-500"
                        />
                        <span className="text-sm">Incluye audio</span>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => setIsAssignmentModalOpen(true)}
                      >
                        Ver Detalle
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <FiAlertCircle className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        No hay asignación para esta semana
                      </span>
                    </div>
                  )}

                </div>
              </div>
            </TabContent>

            <TabContent id="resources" activeId={activeId} className="mt-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold flex items-center">Recursos de la clase</h2>
                  </div>
                </div>

                {content.resources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {content.resources.map(resource => (
                      <div
                        key={resource.id}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                            {getFileIcon(resource.fileName)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                              {resource.description}
                            </h3>
                            <div className="mt-2">
                              {resource.fileName ? (
                                <Link
                                  href={resource.link}
                                  target="_blank"
                                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-sm"
                                >
                                  <FiDownload className="text-sm" />
                                  {resource.fileName}
                                </Link>
                              ) : (
                                <Link
                                  href={resource.link}
                                  target="_blank"
                                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-sm"
                                >
                                  <FiExternalLink className="text-sm" />
                                  Click aquí para ir al enlace
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No hay recursos compartidos aún
                  </p>
                )}
              </div>
            </TabContent>
          </>
        )}
      </Tabs>
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title={`Asignación Semana ${selectedWeek}`}
        className='w-auto max-w-6xl'
      >
        {weekContent?.assignment && (
          <div className="">
            {/* Grid principal */}
            <div className="grid md:grid-cols-2">
              {/* Sección 1: Información de la asignación */}
              <div className="space-y-4 md:border-r-2 md:border-r-blue-500 pb-4 border-b-2 border-b-blue-500">
                <div className="flex items-center gap-2">
                  <FiInfo className="text-blue-500 text-lg" />
                  <h3 className="text-blue-500 font-semibold text-lg">Información de la Asignación</h3>
                </div>
                <div className="md:ml-7 pr-5">
                  <div className="grid md:grid-cols-12 mb-3">
                    <div className="md:col-span-5">
                      <p className="text-sm text-gray-500 dark:text-gray-300">Fecha de Entrega:</p>
                      <p className="font-semibold">
                        {formatInputDateToLong(weekContent?.assignment?.dueDate)}
                      </p>
                    </div>
                    <div className="md:col-span-7">
                      <p className="text-sm text-gray-500 dark:text-gray-300">Estado:</p>
                      <p className={`${getTimeRemainingMessage(weekContent?.assignment?.dueDate).color}`}>
                        {getTimeRemainingMessage(weekContent?.assignment?.dueDate).message}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-500 dark:text-gray-300">Descripción:</p>
                    <p className="whitespace-pre-line">{weekContent?.assignment?.description}</p>
                  </div>

                  {weekContent?.assignment?.fileLink && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Archivo adjunto:</p>
                      <Link
                        href={weekContent?.assignment?.fileLink}
                        target="_blank"
                        className="flex bg-gray-200 dark:bg-gray-700 rounded items-center gap-2 text-blue-500 hover:underline w-fit p-1 px-4"
                      >
                        {getFileIcon(weekContent?.assignment?.fileName)}
                        {weekContent?.assignment?.fileName}
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección 2: Subida de archivo */}
              <div className="space-y-4 pb-4 border-b-2 border-b-blue-500 pl-3">
                <div className="flex items-center gap-2">
                  <FiUpload className="text-blue-500 text-lg" />
                  <h3 className="text-blue-500 font-semibold text-lg">Subir Archivo</h3>
                </div>

                {studentAssignment.fileUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded px-3 py-1">
                      {getFileIcon(studentAssignment.fileName || '')}
                      <Link
                        href={studentAssignment.fileUrl}
                        target="_blank"
                        className="text-blue-500 hover:underline flex items-center gap-2"
                      >
                        <FiDownload className="text-sm" />
                        <span className="font-medium">{studentAssignment.fileName}</span>
                      </Link>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setStudentAssignment(prev => ({
                        ...prev,
                        fileUrl: null,
                        fileName: null
                      }))}
                    >
                      <FiEdit className="mr-2" />
                      Cambiar Archivo
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-base text-gray-500 dark:text-gray-300 block">
                      Aquí puedes subir tu asignación cuando la tengas lista.
                    </div>
                    <div className="md:ml-7">
                      <FileUploader onUploadSuccess={handleFileChange} />
                    </div>
                  </>
                )}
              </div>

              {/* Sección 3: Audio */}
              {weekContent?.assignment?.hasAudio && (
                <div className="space-y-4 pt-3 md:border-r-2 md:border-r-blue-500 border-b-2 pb-4 md:pb-0 border-b-blue-500 md:border-b-0">
                  <div className="flex items-center gap-2">
                    <FiMic className="text-blue-500 text-lg" />
                    <h3 className="text-blue-500 font-semibold text-lg">Grabación de Audio</h3>
                  </div>
                  {studentAssignment.audioUrl ? (
                    <div className="pl-3 pr-5">
                      <AudioPlayer
                        audioUrl={studentAssignment.audioUrl}
                        onDelete={() => setStudentAssignment(prev => ({ ...prev, audioUrl: null }))}
                        onNewRecording={() => setStudentAssignment(prev => ({ ...prev, audioUrl: null }))}
                      />
                    </div>
                  ) : (
                    <div className="pl-3">
                      <AudioRecorder onRecordingComplete={handleAudioRecordingComplete} />
                    </div>
                  )}
                </div>
              )}

              {/* Sección 4: Mensaje */}
              <div className="space-y-4 pt-3 pl-3">
                <div className="flex items-center gap-2">
                  <FiMessageSquare className="text-blue-500 text-lg" />
                  <h3 className="text-blue-500 font-semibold text-lg">Mensaje para el Profesor (Opcional)</h3>
                </div>
                <div className="md:ml-7">
                  <Textarea
                    id="message"
                    value={studentAssignment.message}
                    onChange={handleMessageChange}
                    placeholder="Escribe un mensaje..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-2 pt-6">
              <Button
                variant="secondary"
                onClick={() => setIsAssignmentModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleFileUpload}
                disabled={!studentAssignment.fileUrl}
              >
                Enviar Asignación
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}