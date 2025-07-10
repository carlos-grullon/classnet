'use client';

import { useState, useEffect } from 'react';
import { Tabs, Tab, TabContent } from '@/components/ui/Tabs';
import { Button } from '@/components';
import { FiDownload, FiAlertCircle, FiUser, FiMail, FiBookOpen, FiAward, FiClock, FiDollarSign, FiExternalLink, FiVideo, FiEdit, FiLink, FiSave, FiInfo, FiUpload, FiMic, FiMessageSquare } from 'react-icons/fi';
import { FetchData, ErrorMsj, getFileIcon, SuccessMsj } from '@/utils/Tools.tsx';
import { Select, SelectItem } from '@/components/ui/Select';
import { useCountries } from '@/providers';
import { FaWhatsapp } from 'react-icons/fa';
import { formatInputDateToLong, parseInputDate } from '@/utils/GeneralTools';
import Link from 'next/link';
import { ClassContent } from '@/interfaces/VirtualClassroom';
import { VirtualClassroomSkeleton } from '@/components/skeletons/VirtualClassroomSkeleton';
import { differenceInDays, isAfter, isBefore } from 'date-fns';
import { FileUploader } from '@/components/FileUploader';
import { AudioRecorder } from '@/components/AudioRecorder';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Textarea } from '@/components/Textarea';
import { useParams } from 'next/navigation';
import { WeekContent, StudentAssignment } from '@/interfaces/VirtualClassroom';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { Input } from '@/components/Input';
import { GradesView } from '@/components';

interface TeacherInfo {
  name: string;
  country: string;
  number: string;
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
  whatsappLink: string;
}

export interface ClassContentResponse {
  _id: string;
  classId: string;
  teacher: TeacherInfo;
  class: ClassInfo;
  welcomeMessage?: string;
  resources?: SupportMaterial[];
  durationWeeks: number;
}

export interface ClassContentApiResponse {
  success: boolean;
  content: ClassContentResponse;
}

interface SupportMaterial {
  id: string;
  description: string;
  link: string;
  fileName?: string;
}

const EmptyWeekContent: WeekContent = {
  meetingLink: '',
  recordingLink: '',
  supportMaterials: [],
  assignment: null
}

export default function VirtualClassroom() {
  const params = useParams();
  const classId = params?.id as string;
  const { getCountryByCode } = useCountries();
  const [content, setContent] = useState<ClassContent | null>(null);
  const [weekContent, setWeekContent] = useState<WeekContent>(EmptyWeekContent);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    action: () => { },
    title: 'AVISO',
    message: '',
  });
  const [assignmentType, setAssignmentType] = useState('file');
  const [studentAssignment, setStudentAssignment] = useState<StudentAssignment>({
    fileUrl: null,
    fileName: null,
    audioUrl: null,
    message: '',
    fileSubmission: {
      submittedAt: null,
      isGraded: false,
      grade: null
    },
    audioSubmission: {
      submittedAt: null,
      isGraded: false,
      grade: null
    }
  });
  const [linkUrl, setLinkUrl] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');

  const getTimeRemainingMessage = (dueDate: string | Date, submission?: { submittedAt?: string | Date | null, isGraded?: boolean, grade?: number | null }) => {
    const now = new Date();
    const due = dueDate instanceof Date ? dueDate : parseInputDate(dueDate);

    // Normalize dates to midnight for accurate day difference calculation
    const normalizedNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const normalizedDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    // Caso 1: Asignación calificada
    if (submission?.isGraded && submission?.submittedAt) {
      return {
        message: `Asignación calificada: ${submission.grade}/100`,
        color: 'text-green-600 dark:text-green-400'
      };
    }

    // Caso 2: Enviada pero pendiente de calificación
    if (submission?.submittedAt) {
      const submitted = submission.submittedAt instanceof Date ? submission.submittedAt : parseInputDate(submission.submittedAt);
      const normalizedSubmitted = new Date(submitted.getFullYear(), submitted.getMonth(), submitted.getDate());

      if (isAfter(normalizedSubmitted, normalizedDue)) {
        const daysLate = differenceInDays(normalizedSubmitted, normalizedDue);
        return {
          message: `Enviada ${daysLate} días tarde (pendiente de calificación)`,
          color: 'text-yellow-600 dark:text-yellow-400'
        };
      } else {
        const daysBefore = differenceInDays(normalizedDue, normalizedSubmitted);
        return {
          message: `Enviada ${daysBefore} días antes (pendiente de calificación)`,
          color: 'text-blue-600 dark:text-blue-400'
        };
      }
    }

    // Caso 3: Pendiente de envío (fecha límite en futuro)
    if (isBefore(normalizedNow, normalizedDue)) {
      const daysRemaining = differenceInDays(normalizedDue, normalizedNow);

      if (daysRemaining > 3) {
        return {
          message: `Pendiente de envío: ${daysRemaining} días restantes`,
          color: 'text-yellow-700 dark:text-yellow-400'
        };
      } else {
        return {
          message: `Pendiente de envío: ${daysRemaining} días restantes`,
          color: 'text-red-600 dark:text-red-400'
        };
      }
    }

    // Caso 4: Asignación atrasada (no enviada y fecha límite pasada)
    const daysLate = differenceInDays(normalizedNow, normalizedDue);
    return {
      message: `Asignación atrasada por ${daysLate} días`,
      color: 'text-red-600 dark:text-red-400'
    };
  };

  // Cargar contenido inicial
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const data = await FetchData<ClassContentApiResponse>(`/api/teacher/classes/${classId}/content?userType=student`, {}, 'GET');
        if (data.success && data.content) {
          setContent(
            {
              _id: data.content._id,
              classId: data.content.classId,
              teacher: data.content.teacher,
              class: data.content.class,
              welcomeMessage: data.content.welcomeMessage || '',
              resources: data.content.resources || [],
              durationWeeks: data.content.durationWeeks
            }
          );
          setWhatsappLink(data.content.class.whatsappLink);
        } else {
          ErrorMsj('Contenido no encontrado');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al obtener contenido';
        ErrorMsj(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [classId]);

  useEffect(() => {
    const fetchWeekContent = async () => {
      try {
        const response = await FetchData<{ success: boolean, data: WeekContent, studentAssignment: StudentAssignment }>(
          `/api/teacher/classes/${classId}/week?week=${selectedWeek}`,
          {},
          'GET'
        );
        if (response.success) {
          const content = response.data || EmptyWeekContent
          setWeekContent(content);
          if (response.studentAssignment) {
            setStudentAssignment(response.studentAssignment);
            if (!response.studentAssignment.message) {
              setIsEditingMessage(true);
            }
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al obtener contenido';
        ErrorMsj(message);
      }
    };

    fetchWeekContent();
  }, [classId, selectedWeek]);

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(parseInt(e.target.value));
  };

  const [isEditingMessage, setIsEditingMessage] = useState(false);

  const handleFileChange = ({ url, fileName }: { url: string; fileName: string }) => {
    const updatedContent = {
      ...studentAssignment,
      fileUrl: url,
      fileName: fileName
    };
    setStudentAssignment(updatedContent);
    handleAssignmentSubmit(updatedContent);
  };

  const handleAudioRecordingComplete = (audioUrl: string) => {
    const updatedContent = {
      ...studentAssignment,
      audioUrl: audioUrl
    };
    setStudentAssignment(updatedContent);
    handleAssignmentSubmit(updatedContent);
  };

  const handleAssignmentSubmit = async (studentAssignment: StudentAssignment) => {
    try {
      setIsEditingMessage(false);
      const response = await FetchData<{ success: boolean }>(`/api/student/classes/assignment-submit`, {
        classId: classId,
        weekNumber: selectedWeek,
        ...studentAssignment
      }, 'POST');
      if (response.success) {
        SuccessMsj('Asignación actualizada correctamente');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al enviar la asignación';
      ErrorMsj(message);
    }
  };

  const handleConfirmChangeFile = () => {
    setStudentAssignment(prev => ({
      ...prev,
      fileUrl: null,
      fileName: null
    }));
  };

  const handleRequestAction = (action: () => void, message: string) => {
    setConfirmationConfig({
      action,
      title: 'AVISO',
      message
    });
    setShowConfirmation(true);
  };

  if (isLoading || !content) {
    return <VirtualClassroomSkeleton />;
  }

  return (
    <div className="md:p-4 md:mx-7 p-1">
      <div className="flex flex-col md:flex-row justify-center md:justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-center md:text-left">Aula Virtual</h1>
      </div>

      <Tabs defaultActiveId="presentation">
        {(activeId, setActiveId) => (
          <>
            <div className="grid grid-cols-4 gap-0 border border-gray-500 dark:border-gray-200 mb-4 w-full bg-white dark:bg-gray-800/50 rounded-t-lg">

              <Tab
                id="presentation"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-2 py-2 border-r border-gray-500 dark:border-gray-200 text-xs sm:text-sm font-medium text-center truncate focus:outline-none"
              >
                Presentación
              </Tab>

              <Tab
                id="week"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-2 py-2 border-r border-gray-500 dark:border-gray-200 text-xs sm:text-sm font-medium text-center truncate focus:outline-none"
              >
                <div className="relative flex justify-center items-center">
                  <span className="truncate mr-5">
                    <span className='md:hidden'>Sem {selectedWeek}</span>
                    <span className='hidden md:block'>Semana {selectedWeek}</span>
                  </span>
                  <Select
                    value={selectedWeek.toString()}
                    onChange={handleWeekChange}
                    className="w-4 opacity-0 absolute right-0"
                  >
                    {Array.from({ length: content.durationWeeks }, (_, i) => i + 1).map(week => (
                      <SelectItem key={week} value={week.toString()}>
                        Semana {week}
                      </SelectItem>
                    ))}
                  </Select>
                  <div className="pointer-events-none absolute right-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </Tab>

              <Tab
                id="resources"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-2 py-2 border-r border-gray-500 dark:border-gray-200 text-xs sm:text-sm font-medium text-center truncate focus:outline-none"
              >
                Recursos
              </Tab>

              <Tab
                id="grades"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-2 py-2 text-xs sm:text-sm font-medium text-center truncate focus:outline-none"
              >
                <span className='md:hidden'>Califs.</span>
                <span className='hidden md:block'>Calificaciones</span>
              </Tab>
              
            </div>

            <TabContent id="presentation" activeId={activeId} className="mt-4">
              <div className="grid md:grid-cols-12 gap-6">

                {/* Teacher Information */}
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow p-6 md:col-span-6">
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
                          <p className="text-gray-700 dark:text-gray-300">{content.teacher.number}</p>
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
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow p-6 md:col-span-6">
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
                          {whatsappLink ? (
                            <Link
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline break-all whitespace-normal"
                            >
                              {whatsappLink}
                            </Link>
                          ) : (
                            <span className="text-gray-700 dark:text-gray-300">Aún no se ha agregado un Link</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Welcome Message */}
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow p-6 md:col-span-12">
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
              <div className="gap-4 grid md:grid-cols-12">
                {/* Sección Reunión */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 md:col-span-6 col-span-12">
                  <div className="md:col-span-5 col-span-12">
                    <div className="flex items-center gap-2 mb-3">
                      <FiVideo className="text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Reunión Semana {selectedWeek}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="border border-black dark:border-gray-400 w-full min-w-[300px]">
                        <thead>
                          <tr className="hidden md:table-row">
                            <th className="border border-black dark:border-gray-400 p-2 font-medium">Link de la reunión</th>
                            <th className="border border-black dark:border-gray-400 p-2 font-medium">Link de la grabación</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="flex flex-col md:table-row">
                            <td className="border border-black dark:border-gray-400 p-2">
                              <div className="md:hidden font-medium mb-1">Link de la reunión</div>
                              {weekContent?.meetingLink ? (
                                <div className="flex justify-center">
                                  <Link
                                    href={weekContent.meetingLink}
                                    target="_blank"
                                    className="flex justify-center items-center gap-2 text-blue-500 hover:underline max-w-full"
                                  >
                                    <FiExternalLink />
                                    <span className="truncate w-[180px] md:w-[220px] block">{weekContent.meetingLink}</span>
                                  </Link>
                                </div>
                              ) : (
                                <div className="flex justify-center text-center items-center gap-2 bg-gray-200 dark:bg-gray-700 p-2 rounded w-fit mx-auto">
                                  <FiAlertCircle className="text-red-600 dark:text-red-400" />
                                  <p className="text-gray-500 dark:text-gray-400">No se ha agregado un link de reunión</p>
                                </div>
                              )}
                            </td>
                            <td className="border border-black dark:border-gray-400 p-2">
                              <div className="md:hidden font-medium mb-1">Link de la grabación</div>
                              {weekContent?.recordingLink ? (
                                <div className="flex justify-center">
                                  <Link
                                    href={weekContent.recordingLink}
                                    target="_blank"
                                    className="flex justify-center items-center gap-2 text-blue-500 hover:underline max-w-full"
                                  >
                                    <FiExternalLink />
                                    <span className="truncate w-[180px] md:w-[220px] block">{weekContent.recordingLink}</span>
                                  </Link>
                                </div>
                              ) : (
                                <div className="flex justify-center text-center items-center gap-2 bg-gray-200 dark:bg-gray-700 p-2 rounded w-fit mx-auto">
                                  <FiAlertCircle className="text-red-600 dark:text-red-400" />
                                  <p className="text-gray-500 dark:text-gray-400">No se ha agregado un link de grabación</p>
                                </div>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                {/* Sección Material de apoyo */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 md:col-span-6 col-span-12">
                  <div className="flex items-center gap-2 mb-3">
                    <FiBookOpen className="text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Material de apoyo</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weekContent?.supportMaterials?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-4 col-span-2">
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
                                <Link
                                  href={material.link}
                                  target="_blank"
                                  className="text-blue-500 hover:underline"
                                >
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
                {/* Sección Asignación */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 md:col-span-6 col-span-12">
                  <div className="flex items-center justify-center text-center gap-2 mb-3">
                    <FiEdit className="text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Información de la Asignación - Semana {selectedWeek}</h3>
                  </div>
                  {weekContent?.assignment ? (
                    <div className="space-y-2">
                      <table className="w-full border border-black dark:border-gray-400">
                        <thead>
                          <tr className="border-b border-black dark:border-gray-400">
                            <th className="p-2 border-r border-black text-center dark:border-gray-400">Fecha de Entrega</th>
                            <th className="p-2 border-r border-black text-center dark:border-gray-400">Estado</th>
                            <th className="p-2 text-center dark:border-gray-400">Estado del audio</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border-r border-black dark:border-gray-400">
                              {formatInputDateToLong(weekContent?.assignment?.dueDate)}
                            </td>
                            <td className="p-2 border-r border-black dark:border-gray-400">
                              <span className={`bg-gray-200 dark:bg-gray-700 p-1 rounded font-semibold block text-center ${getTimeRemainingMessage(weekContent?.assignment?.dueDate, studentAssignment?.fileSubmission).color}`}>
                                {getTimeRemainingMessage(weekContent?.assignment?.dueDate, studentAssignment?.fileSubmission).message}
                              </span>
                            </td>
                            <td className="p-2">
                              <span className={`bg-gray-200 dark:bg-gray-700 p-1 rounded font-semibold block text-center ${getTimeRemainingMessage(weekContent?.assignment?.dueDate, studentAssignment?.audioSubmission).color}`}>
                                {getTimeRemainingMessage(weekContent?.assignment?.dueDate, studentAssignment?.audioSubmission).message}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="p-2 border-t border-black dark:border-gray-400">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Archivo:</span>
                                {weekContent?.assignment?.fileLink ? (
                                  <span className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded px-3 py-1">
                                    {getFileIcon(weekContent?.assignment?.fileName)}
                                    <Link
                                      href={weekContent?.assignment?.fileLink}
                                      target="_blank"
                                      className="text-blue-500 hover:underline"
                                    >
                                      {weekContent?.assignment?.fileName}
                                    </Link>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 p-2 rounded">
                                    <FiAlertCircle className="text-red-600 dark:text-red-400" />
                                    <p className="text-gray-500 dark:text-gray-400">No se ha agregado un archivo</p>
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="mb-3">
                        <p className="text-sm text-gray-500 dark:text-gray-300">Descripción:</p>
                        <div
                          className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-hidden"
                        >
                          <div
                            className="whitespace-pre-wrap relative"
                            style={{
                              maxHeight: expandedDescription ? 'none' : '8rem',
                              maskImage: expandedDescription ? 'none' : 'linear-gradient(to bottom, black 70%, transparent 100%)'
                            }}
                          >
                            {weekContent?.assignment?.description || 'No hay descripción disponible'}
                          </div>
                        </div>
                        {weekContent?.assignment?.description && weekContent.assignment.description.length > 100 && (
                          <button
                            className="mt-1 w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            onClick={() => setExpandedDescription(!expandedDescription)}
                          >
                            {expandedDescription ? 'Ver menos' : '... Ver más'}
                          </button>
                        )}
                      </div>

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
                {/* Seccion Subir Asignación */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 md:col-span-6 col-span-12">
                  <div className="flex items-center justify-center text-center gap-2 mb-3">
                    <FiEdit className="text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Enviar Asignación - Semana {selectedWeek}</h3>
                  </div>

                  {weekContent.assignment ? (
                    <>
                      <div className="space-y-4 mb-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                        <div className="flex justify-between">
                          {assignmentType === 'file' ? (
                            <div className="flex items-center gap-2">
                              <FiUpload className="text-blue-500 text-lg" />
                              <h4 className="text-blue-500 font-semibold">Subir Archivo</h4>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <FiLink className="text-blue-500 text-lg" />
                              <h4 className="text-blue-500 font-semibold">Subir Link</h4>
                            </div>
                          )}
                          {!studentAssignment.fileUrl && (
                            assignmentType === 'file' ? (
                              <Button
                                variant='outline'
                                size="sm"
                                onClick={() => setAssignmentType('link')}
                                className="flex items-center"
                              >
                                <FiLink size={16} className='mr-1' />
                                Subir Link
                              </Button>
                            ) : (
                              <Button
                                variant='outline'
                                size="sm"
                                onClick={() => setAssignmentType('file')}
                                className="flex items-center"
                              >
                                <FiUpload size={16} className='mr-1' />
                                Subir Archivo
                              </Button>
                            )
                          )}
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
                              onClick={() => handleRequestAction(handleConfirmChangeFile, '¿Estás seguro de que deseas cambiar el archivo?')}
                            >
                              <FiEdit className="mr-2" />
                              {assignmentType === 'file' ? 'Cambiar Archivo' : 'Cambiar Link'}
                            </Button>
                          </div>
                        ) : (
                          assignmentType === 'file' ? (
                            <FileUploader path={`classes/${classId}/student/${selectedWeek}`} onUploadSuccess={handleFileChange} />
                          ) : (
                            <div className="space-y-4">
                              <Input
                                label="URL"
                                placeholder="https://ejemplo.com"
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                pattern="https://.*"
                              />

                              <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => {
                                  const updatedAssignment = {
                                    ...studentAssignment,
                                    fileUrl: linkUrl,
                                    fileName: 'Enlace compartido'
                                  };
                                  setStudentAssignment(updatedAssignment);
                                  handleAssignmentSubmit(updatedAssignment);
                                  setLinkUrl('');
                                }}
                              >
                                <FiSave className="mr-2" />
                                Guardar Link
                              </Button>
                            </div>
                          )
                        )}
                      </div>

                      {weekContent?.assignment?.hasAudio && (
                        <div className="space-y-4 mb-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                          <div className="flex items-center gap-2">
                            <FiMic className="text-blue-500 text-lg" />
                            <h4 className="text-blue-500 font-semibold">Grabación de Audio</h4>
                          </div>
                          {studentAssignment.audioUrl ? (
                            <AudioPlayer
                              audioUrl={studentAssignment.audioUrl}
                              onNewRecording={() => handleRequestAction(
                                () => setStudentAssignment(prev => ({ ...prev, audioUrl: null })),
                                '¿Estás seguro de que deseas grabar un nuevo audio?'
                              )}
                              onDelete={() => handleRequestAction(
                                () => setStudentAssignment(prev => ({ ...prev, audioUrl: null })),
                                '¿Estás seguro de que deseas eliminar el audio?'
                              )}
                            />
                          ) : (
                            <AudioRecorder onRecordingComplete={handleAudioRecordingComplete} path={`classes/${classId}/student/${selectedWeek}`} />
                          )}
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <FiMessageSquare className="text-blue-500 text-lg" />
                          <h4 className="text-blue-500 font-semibold">Mensaje para el Profesor (Opcional)</h4>
                        </div>

                        {studentAssignment.message && !isEditingMessage ? (
                          <div className="space-y-3">
                            <p className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                              {studentAssignment.message}
                            </p>
                            <div className="flex justify-end mt-4">
                              <Button
                                size="sm"
                                onClick={() => setIsEditingMessage(true)}
                                className="flex items-center"
                              >
                                <FiEdit size={16} className='mr-1' />
                                Editar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className='space-y-3'>
                            <Textarea
                              id="message"
                              value={studentAssignment.message || ''}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                setStudentAssignment({
                                  ...studentAssignment,
                                  message: e.target.value
                                });
                              }}
                              placeholder="Escribe un mensaje..."
                              rows={4}
                            />
                            <div className="flex justify-end mt-4">
                              <Button
                                size="sm"
                                onClick={() => handleAssignmentSubmit(studentAssignment)}
                                className="flex items-center"
                              >
                                <FiSave size={16} className='mr-1' />
                                Guardar
                              </Button>
                            </div>
                          </div>
                        )}

                      </div>

                    </>
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

            {/* Sección Recursos */}
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
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {resource.fileName}
                                </Link>
                              ) : (
                                <Link
                                  href={resource.link}
                                  target="_blank"
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
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

            <TabContent id="grades" activeId={activeId} className="mt-4">
              <GradesView classId={classId as string} />
            </TabContent>
          </>
        )}
      </Tabs>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
}