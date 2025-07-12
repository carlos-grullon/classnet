'use client';

import { useState, useEffect, useRef } from 'react';
import { Tabs, Tab, TabContent } from '@/components/ui/Tabs';
import { Button } from '@/components';
import { FiDownload, FiEdit, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import { FetchData, ErrorMsj, SuccessMsj, getFileIcon } from '@/utils/Tools.tsx';
import { Select, SelectItem } from '@/components/ui/Select';
import { Modal } from '@/components/Modal';
import { Input, Textarea, DateInput, ToggleSwitch } from '@/components';
import { FileUploader } from '@/components/FileUploader';
import Link from 'next/link';
import { useCountries } from '@/providers';
import { FiFileText, FiLink, FiAlertCircle, FiCalendar, FiVolume2, FiUser, FiMail, FiBookOpen, FiAward, FiClock, FiInfo, FiDollarSign, FiExternalLink } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { ClassContent } from '@/interfaces/VirtualClassroom';
import { formatInputDateToLong } from '@/utils/GeneralTools';
import { SupportMaterial, WeekContent } from '@/interfaces/VirtualClassroom';
import { VirtualClassroomSkeleton } from '@/components/skeletons/VirtualClassroomSkeleton';
import { useParams } from 'next/navigation';
import { FaUserGraduate, FaUsers } from 'react-icons/fa';
import Image from 'next/image';

export default function VirtualClassroom() {
  const params = useParams();
  const classId = params.id as string;
  const [content, setContent] = useState<ClassContent | null>(null);
  const [weekContent, setWeekContent] = useState<WeekContent>({
    meetingLink: '',
    recordingLink: '',
    supportMaterials: [],
    assignment: null
  });
  const [originalWeekContent, setOriginalWeekContent] = useState<WeekContent>({
    meetingLink: '',
    recordingLink: '',
    supportMaterials: [],
    assignment: null
  });
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [materialType, setMaterialType] = useState<'link' | 'file' | null>(null);
  const [materialData, setMaterialData] = useState({
    link: '',
    title: '',
    file: null as File | null
  });
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<{
    id?: string;
    dueDate: string;
    description: string;
    hasAudio: boolean;
    fileLink: string;
    fileName: string;
  }>({
    dueDate: '',
    description: '',
    hasAudio: false,
    fileLink: '',
    fileName: ''
  });
  const [isEditingWhatsapp, setIsEditingWhatsapp] = useState(false);
  const [isEditingWelcomeMessage, setIsEditingWelcomeMessage] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [newResource, setNewResource] = useState<SupportMaterial>({
    id: '',
    description: '',
    link: '',
    fileName: ''
  });
  const [resourceType, setResourceType] = useState<'file' | 'link'>('file');
  const [isEditingResources, setIsEditingResources] = useState(false);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const { getCountryByCode } = useCountries();
  const [whatsappLink, setWhatsappLink] = useState('');

  // Ref para el modal pequeñito
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsAddMaterialModalOpen(false);
        setIsAssignmentModalOpen(false);
        setShowResourceModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cargar contenido inicial
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const data = await FetchData<{ success: boolean, content: ClassContent }>(`/api/teacher/classes/${classId}/content?userType=teacher`, {}, 'GET');
        if (data.success && data.content) {
          setContent(data.content);
          setWhatsappLink(data.content.class.whatsappLink)
        } else {
          ErrorMsj('Error obteniendo datos del curso');
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
        const response = await FetchData<{ success: boolean, data: WeekContent | null }>(
          `/api/teacher/classes/${classId}/week?week=${selectedWeek}`,
          {},
          'GET'
        );
        const content = response.data || {
          meetingLink: '',
          recordingLink: '',
          supportMaterials: [],
          assignment: null
        };
        setOriginalWeekContent(content);
        setWeekContent(content);
      } catch (error) {
        console.error('Error loading week content:', error);
      }
    };

    fetchWeekContent();
  }, [classId, selectedWeek]);

  if (isLoading || !content) {
    return <VirtualClassroomSkeleton />;
  }

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(parseInt(e.target.value));
  };

  const handleRemoveSupportMaterial = (id: string) => {
    const updated = {
      ...weekContent,
      supportMaterials: weekContent.supportMaterials.filter(m => m.id !== id)
    }
    setWeekContent(updated);
    handleSaveWeekContent(updated);
  };

  const handleOpenAssignmentModal = () => {
    setAssignmentForm({
      dueDate: typeof weekContent.assignment?.dueDate === 'string' ? weekContent.assignment.dueDate : '',
      description: weekContent.assignment?.description || '',
      hasAudio: weekContent.assignment?.hasAudio || false,
      fileLink: weekContent.assignment?.fileLink || '',
      fileName: weekContent.assignment?.fileName || ''
    });
    setIsAssignmentModalOpen(true);
  };

  const handleAddAssignment = () => {
    const updatedContent = {
      ...weekContent,
      assignment: {
        dueDate: assignmentForm.dueDate,
        description: assignmentForm.description,
        hasAudio: assignmentForm.hasAudio,
        fileLink: assignmentForm.fileLink,
        fileName: assignmentForm.fileName
      }
    };
    setWeekContent(updatedContent);
    handleSaveWeekContent(updatedContent);
    setIsAssignmentModalOpen(false);
  };

  const handleAssignmentFileUpload = (result: { url: string; fileName: string }) => {
    setAssignmentForm(prev => ({
      ...prev,
      fileLink: result.url,
      fileName: result.fileName
    }));
  };

  const handleSaveContent = async () => {
    try {
      const response = await FetchData<{ success: boolean }>(`/api/teacher/classes/${classId}/content`, {
        welcomeMessage: content.welcomeMessage,
        resources: content.resources
      }, 'PATCH');
      if (response.success) {
        return true;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error guardando contenido';
      ErrorMsj(message);
      console.error(error);
      return false;
    }
  };

  const handleSaveWhatsappLink = async () => {
    try {
      const response = await FetchData<{ success: boolean }>("/api/classes", {
        action: 'updateWhatsappLink',
        classId: classId,
        whatsappLink: whatsappLink
      }, 'PATCH');
      if (response.success) {
        setIsEditingWhatsapp(false);
        SuccessMsj('Whatsapp link guardado');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error guardando whatsapp link';
      ErrorMsj(message);
      console.error(error);
    }
  };

  const handleSaveWelcomeMessage = async () => {
    const success = await handleSaveContent();
    if (success) {
      setIsEditingWelcomeMessage(false);
      SuccessMsj('Mensaje de bienvenida guardado');
    }
  };

  const handleAddResource = () => {
    setContent({
      ...content,
      resources: [...content.resources, {
        ...newResource,
        id: Date.now().toString()
      }]
    });
    setShowResourceModal(false);
    setNewResource({ id: '', description: '', link: '', fileName: '' });
  };

  const handleRemoveResource = (id: string) => {
    setContent({
      ...content,
      resources: content.resources.filter(res => res.id !== id)
    });
  };

  const handleSaveResources = async () => {
    const success = await handleSaveContent();
    if (success) {
      SuccessMsj('Recursos guardados correctamente');
      setIsEditingResources(false);
    }
  };

  const handleSaveWeekContent = async (weekContent: WeekContent) => {
    setIsEditingLinks(false);
    try {
      const response = await FetchData<{ success: boolean }>(
        `/api/teacher/classes/${classId}/week?week=${selectedWeek}`,
        {
          ...weekContent,
          weekNumber: selectedWeek,
        },
        'POST'
      );

      if (response.success) {
        setOriginalWeekContent(weekContent);
        SuccessMsj('Contenido semanal actualizado');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error guardando contenido';
      ErrorMsj(message);
      console.error(error);
    }
  };

  const handleCancelEditingWeekContent = () => {
    setWeekContent(originalWeekContent);
    setIsEditingLinks(false);
  };

  return (
    <div className="md:p-4 md:mx-7 p-1">
      <div className="flex flex-col md:flex-row justify-center md:justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-center md:text-left">Aula Virtual</h1>
      </div>

      <Tabs defaultActiveId="presentation">
        {(activeId, setActiveId) => (
          <>
            <div className="grid grid-cols-4 md:grid-cols-5 gap-0 border border-gray-500 dark:border-gray-200 mb-4 w-full bg-white dark:bg-gray-800/50 rounded-t-lg">

              <Tab
                id="presentation"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-2 py-2 border-r border-b border-gray-500 dark:border-gray-200 text-xs sm:text-sm font-medium text-center truncate focus:outline-none"
              >
                Presentación
              </Tab>

              <Tab
                id="week"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-2 py-2 border-r border-b border-gray-500 dark:border-gray-200 text-xs sm:text-sm font-medium text-center truncate focus:outline-none"
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
                id="students"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-2 py-2 border-r border-b border-gray-500 dark:border-gray-200 text-xs sm:text-sm font-medium text-center truncate focus:outline-none"
              >
                Estudiantes
              </Tab>

              <Tab
                id="resources"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-2 py-2 border-r border-b border-gray-500 dark:border-gray-200 text-xs sm:text-sm font-medium text-center truncate focus:outline-none"
              >
                Recursos
              </Tab>

              <Tab
                id="grade"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-2 py-2 border-r border-gray-500 dark:border-gray-200 text-xs sm:text-sm font-medium text-center truncate focus:outline-none"
              >
                Calificación
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
                      <Image
                        src={content.teacher.photo || '/images/default-avatar.png'}
                        alt={content.teacher.name}
                        width={128} // Equivalente a w-32 (32 * 4 = 128)
                        height={128} // Equivalente a h-32
                        className="rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
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
                            {isEditingWhatsapp ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSaveWhatsappLink}
                              >
                                <FiSave className="text-blue-500" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditingWhatsapp(true)}
                              >
                                <FiEdit />
                              </Button>
                            )}
                          </p>
                          {isEditingWhatsapp ? (
                            <div className="flex items-center gap-2 w-full">
                              <Input
                                value={whatsappLink}
                                onChange={(e) => setWhatsappLink(e.target.value)}
                                placeholder="WhatsApp group link"
                                className="flex-1"
                              />
                            </div>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 break-all whitespace-normal overflow-hidden">
                              {whatsappLink || 'Aún no se ha agregado un Link'}
                            </p>
                          )}
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
                    {isEditingWelcomeMessage ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveWelcomeMessage}
                      >
                        <FiSave className="text-blue-500 mr-2" /> Guardar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingWelcomeMessage(true)}
                      >
                        <FiEdit className="text-blue-500 mr-2" /> Editar
                      </Button>
                    )}
                  </div>

                  {isEditingWelcomeMessage ? (
                    <Textarea
                      id="welcome-message"
                      value={content.welcomeMessage}
                      onChange={(e) => setContent({
                        ...content,
                        welcomeMessage: e.target.value
                      })}
                      rows={5}
                      placeholder="Escribe un mensaje personalizado para tus estudiantes..."
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {content.welcomeMessage || 'Aún no se ha agregado un mensaje de bienvenida'}
                    </p>
                  )}
                </div>
              </div>
            </TabContent>

            <TabContent id="week" activeId={activeId} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sección Reunión */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      Reunión Semana {selectedWeek}
                    </h3>
                    <div className="flex gap-2">
                      {isEditingLinks ? (
                        <>
                          <Button variant="outline" size="sm" onClick={handleCancelEditingWeekContent}>
                            <FiX className="mr-1" /> Cancelar
                          </Button>
                          <Button size="sm" onClick={() => handleSaveWeekContent(weekContent)}>
                            <FiSave className="mr-1" /> Guardar
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => setIsEditingLinks(true)}>
                          <FiEdit className="mr-1" /> Editar
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="font-medium text-center">Link de la reunión:</div>
                    <Input value={weekContent.meetingLink}
                      disabled={!isEditingLinks}
                      onChange={(e) => setWeekContent({ ...weekContent, meetingLink: e.target.value })} />
                    <div className="font-medium text-center">Link de la grabación:</div>
                    <Input value={weekContent.recordingLink}
                      disabled={!isEditingLinks}
                      onChange={(e) => setWeekContent({ ...weekContent, recordingLink: e.target.value })} />
                  </div>
                </div>

                {/* Sección Material de Apoyo */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      Material de Apoyo
                    </h3>
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => setIsAddMaterialModalOpen(!isAddMaterialModalOpen)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Agregar
                      </Button>

                      {isAddMaterialModalOpen && (
                        <div
                          ref={modalRef}
                          className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => {
                              setMaterialType('link');
                              setIsAddMaterialModalOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Agregar enlace
                          </button>
                          <button
                            onClick={() => {
                              setMaterialType('file');
                              setIsAddMaterialModalOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Subir archivo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {weekContent.supportMaterials.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-4">
                        <FiAlertCircle className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Nada por aquí...</span>
                      </div>
                    ) : (
                      weekContent.supportMaterials.map(material => (
                        <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
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
                          <Button size="sm" onClick={() => handleRemoveSupportMaterial(material.id)}>
                            Eliminar
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sección Asignación */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        Asignación
                      </h3>
                      <Button size="sm" variant="outline" onClick={handleOpenAssignmentModal}>
                        <FiEdit className="mr-1" /> Editar
                      </Button>
                    </div>
                    {weekContent.assignment ? (
                      <div className="space-y-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-500">Fecha de Entrega:</span>
                          <span className="font-semibold">
                            {typeof weekContent.assignment.dueDate === 'string' ? formatInputDateToLong(weekContent.assignment.dueDate) : ''}
                          </span>
                        </div>
                        {weekContent.assignment.fileLink && (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-500">Archivo:</span>
                            <Link
                              href={weekContent.assignment.fileLink}
                              target="_blank"
                              className="text-blue-500 hover:underline"
                            >
                              {weekContent.assignment.fileName}
                            </Link>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={weekContent.assignment.hasAudio}
                            readOnly
                            className="rounded text-blue-500"
                          />
                          <span className="text-sm">Incluye audio</span>
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
                </div>
              </div>
            </TabContent>

            <TabContent id="students" activeId={activeId} className="mt-4">
              <div className="flex flex-col items-center justify-center p-6 gap-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="bg-blue-100 dark:bg-blue-900 p-5 rounded-full relative">
                  <FaUserGraduate className="text-blue-600 dark:text-blue-300 text-4xl" />
                  <div className="absolute -top-2 -right-2 bg-green-400 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    <FaUsers className="text-green-800 text-xs" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Students enrolled</h2>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                  This page is still in development.
                </p>
              </div>
            </TabContent>

            <TabContent id="resources" activeId={activeId} className="mt-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold flex items-center">Recursos de la clase</h2>
                    {isEditingResources && (
                      <Button
                        size="sm"
                        onClick={() => setShowResourceModal(true)}
                      >
                        <FiPlus className="mr-2" /> Agregar Recurso
                      </Button>
                    )}
                  </div>
                  {isEditingResources ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveResources}
                        variant="primary"
                      >
                        <FiSave className="mr-2" /> Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingResources(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setIsEditingResources(true)}
                    >
                      <FiEdit className="mr-2" /> Editar
                    </Button>
                  )}
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
                          {isEditingResources && (
                            <button
                              onClick={() => handleRemoveResource(resource.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    {isEditingResources ? 'No hay recursos compartidos aún' : 'No hay recursos compartidos'}
                  </p>
                )}
              </div>
            </TabContent>

            <TabContent id="grade" activeId={activeId} className="mt-4">
              <div className="p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Asignaciones de los estudiantes</h2>
                <Link
                  href={`/teacher/classes/${classId}/grading`}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Calificar Entregas
                </Link>
              </div>
            </TabContent>
          </>
        )}
      </Tabs>

      {/* Modal para agregar recursos */}
      <Modal
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        title="Agregar Recurso Compartido"
      >
        <div className="space-y-4">
          <Input
            label="Descripción"
            value={newResource.description}
            onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
          />

          <div className="flex gap-2 mb-4">
            <Button
              variant={resourceType === 'file' ? 'primary' : 'outline'}
              onClick={() => setResourceType('file')}
            >
              <FiFileText className="mr-2" /> Subir archivo
            </Button>
            <Button
              variant={resourceType === 'link' ? 'primary' : 'outline'}
              onClick={() => setResourceType('link')}
            >
              <FiLink className="mr-2" /> Añadir enlace
            </Button>
          </div>

          {resourceType === 'file' ? (
            <FileUploader
              path={`classes/${classId}/teacher/${selectedWeek}`}
              onUploadSuccess={(result: { url: string; fileName: string }) => {
                setNewResource({ ...newResource, link: result.url, fileName: result.fileName });
              }}
            />
          ) : (
            <Input
              label="URL del recurso"
              value={newResource.link}
              onChange={(e) => setNewResource({ ...newResource, link: e.target.value, fileName: '' })}
              placeholder="https://ejemplo.com/recurso"
            />
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowResourceModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddResource}
              disabled={!newResource.description || !newResource.link}
            >
              Agregar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para enlace */}
      <Modal
        isOpen={materialType === 'link'}
        onClose={() => {
          setMaterialType(null);
          setIsAddMaterialModalOpen(false);
        }}
        title="Agregar Enlace de Material"
      >
        <div className="space-y-4">
          <Input
            label="Título"
            value={materialData.title}
            onChange={(e) => setMaterialData({ ...materialData, title: e.target.value })}
          />
          <Input
            label="Enlace"
            value={materialData.link}
            onChange={(e) => setMaterialData({ ...materialData, link: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setMaterialType(null)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if ((materialType === 'link' && materialData.link && materialData.title) ||
                (materialType === 'file' && materialData.link && materialData.title)) {
                const newMaterial = {
                  id: Date.now().toString(),
                  description: materialData.title,
                  link: materialData.link,
                  fileName: materialData.link.split('/').pop() || materialData.title || 'Link'
                };
                const updatedContent = {
                  ...weekContent,
                  supportMaterials: [
                    ...weekContent.supportMaterials.map(m => ({
                      ...m,
                      fileName: m.fileName || m.link.split('/').pop() || 'Link'
                    })),
                    newMaterial
                  ]
                }
                setWeekContent(updatedContent);
                setMaterialData({ link: '', title: '', file: null });
                setMaterialType(null);
                setIsAddMaterialModalOpen(false);
                handleSaveWeekContent(updatedContent);
              }
            }}>
              Subir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para archivo */}
      <Modal
        isOpen={materialType === 'file'}
        onClose={() => {
          setMaterialType(null);
          setIsAddMaterialModalOpen(false);
        }}
        title="Subir Archivo de Material"
      >
        <div className="space-y-4">
          {materialType === 'link' ? (
            <>
              <Input
                label="Título"
                value={materialData.title}
                onChange={(e) => setMaterialData({ ...materialData, title: e.target.value })}
              />
              <Input
                label="Enlace"
                value={materialData.link}
                onChange={(e) => setMaterialData({ ...materialData, link: e.target.value })}
              />
            </>
          ) : (
            <>
              <Input
                label="Título"
                value={materialData.title}
                onChange={(e) => setMaterialData({ ...materialData, title: e.target.value })}
              />
              <FileUploader
                path={`classes/${classId}/teacher/${selectedWeek}`}
                onUploadSuccess={({ url, fileName }) => {
                  const updatedContent = {
                    ...weekContent,
                    supportMaterials: [
                      ...weekContent.supportMaterials,
                      {
                        id: Date.now().toString(),
                        description: materialData.title || fileName || 'Documento',
                        link: url,
                        fileName: fileName
                      }
                    ]
                  };
                  setWeekContent(updatedContent);
                  handleSaveWeekContent(updatedContent);
                  setMaterialData({ link: '', title: '', file: null });
                  setMaterialType(null);
                  setIsAddMaterialModalOpen(false);
                }}
              />
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setMaterialType(null)}>
            Cancelar
          </Button>
          <Button onClick={() => {
            if ((materialType === 'link' && materialData.link && materialData.title) ||
              (materialType === 'file' && materialData.link && materialData.title)) {
              const newMaterial = {
                id: Date.now().toString(),
                description: materialData.title,
                link: materialData.link,
                fileName: materialData.link.split('/').pop() || materialData.title || 'Link'
              };
              const updatedContent = {
                ...weekContent,
                supportMaterials: [
                  ...weekContent.supportMaterials.map(m => ({
                    ...m,
                    fileName: m.fileName || m.link.split('/').pop() || 'Link'
                  })),
                  newMaterial
                ]
              };
              setWeekContent(updatedContent);
              handleSaveWeekContent(updatedContent);
              setMaterialData({ link: '', title: '', file: null });
              setMaterialType(null);
              setIsAddMaterialModalOpen(false);
            }
          }}>
            Subir
          </Button>
        </div>
      </Modal>

      {/* Assignment Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        className='max-w-6xl'
        onClose={() => setIsAssignmentModalOpen(false)}
        title={weekContent.assignment ? 'Editar Asignación' : 'Agregar Asignación'}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className='max-w-sm flex-1'>
              <DateInput
                label={
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-blue-500 text-2xl" />
                    <span>Fecha de Entrega</span>
                  </div>
                }
                value={assignmentForm.dueDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssignmentForm(prev => ({
                  ...prev,
                  dueDate: e.target.value
                }))}
              />
            </div>
            <ToggleSwitch
              label={
                <div className="flex items-center gap-2">
                  <FiVolume2 className="text-blue-500 text-2xl" />
                  <span>Incluye audio</span>
                </div>
              }
              checked={assignmentForm.hasAudio}
              onChange={(checked) => setAssignmentForm(prev => ({
                ...prev,
                hasAudio: checked
              }))}
              trueLabel="Si"
              falseLabel="No"
            />

          </div>

          <Textarea
            id="assignmentDescription"
            label={
              <div className="flex items-center gap-2">
                <FiFileText className="text-blue-500 text-2xl" />
                <span>Descripción</span>
              </div>
            }
            value={assignmentForm.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAssignmentForm(prev => ({
              ...prev,
              description: e.target.value
            }))}
            rows={10}
          />

          <FileUploader
            path={`classes/${classId}/teacher/${selectedWeek}`}
            onUploadSuccess={handleAssignmentFileUpload}
          />

          {assignmentForm.fileLink && (
            <div className="flex items-center gap-2 text-sm">
              <FiFileText className="text-blue-500 text-xl" />
              <span className="text-gray-700 dark:text-gray-300">
                {assignmentForm.fileName}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAssignmentModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddAssignment}
              disabled={!assignmentForm.dueDate || !assignmentForm.description}
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}