'use client';

import { useState, useEffect } from 'react';
import { Tabs, Tab, TabContent } from '@/components/ui/Tabs';
import { Button } from '@/components';
import { FiDownload } from 'react-icons/fi';
import { FetchData, ErrorMsj, SuccessMsj, getFileIcon } from '@/utils/Tools.tsx';
import { Select, SelectItem } from '@/components/ui/Select';
import { Input } from '@/components';
import { useCountries } from '@/providers';
import { FiAlertCircle, FiUser, FiMail, FiBookOpen, FiAward, FiClock, FiInfo, FiDollarSign, FiExternalLink } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { formatInputDateToLong } from '@/utils/GeneralTools';
import Link from 'next/link';
import { WeekContent, ClassContent } from '@/interfaces/VirtualClassroom';
import { VirtualClassroomSkeleton } from '@/components/skeletons/VirtualClassroomSkeleton';

export default function VirtualClassroom({ params }: { params: { id: string } }) {
  const { getCountryByCode } = useCountries();
  const classId = params.id;
  const [content, setContent] = useState<ClassContent | null>(null);
  const [weekContent, setWeekContent] = useState<WeekContent>({
    meetingLink: '',
    recordingLink: '',
    supportMaterials: [],
    assignment: null
  });
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar contenido inicial
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const data = await FetchData(`/api/teacher/classes/${classId}/content`, {}, 'GET');
        console.log(data);
        if (data.success && data.data) {
          setContent(
            {
              _id: data.data._id,
              classId: data.data.classId,
              teacher: data.data.teacher,
              class: data.data.class,
              welcomeMessage: data.data.welcomeMessage,
              whatsappLink: data.data.whatsappLink,
              resources: data.data.resources,
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
        const response = await FetchData(
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
        setWeekContent(content);
      } catch (error) {
        console.error('Error loading week content:', error);
      }
    };

    fetchWeekContent();
  }, [classId, selectedWeek]);

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(parseInt(e.target.value));
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
                  <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    Reunión Semana {selectedWeek}
                  </h3>
                  <div className="space-y-3">
                    <div className="font-medium text-center">Link de la reunión:</div>
                    <Input value={weekContent.meetingLink}
                      disabled={true}
                      onChange={(e) => setWeekContent({ ...weekContent, meetingLink: e.target.value })} />
                    <div className="font-medium text-center">Link de la grabación:</div>
                    <Input value={weekContent.recordingLink}
                      disabled={true}
                      onChange={(e) => setWeekContent({ ...weekContent, recordingLink: e.target.value })} />
                  </div>
                </div>

                {/* Sección Material de Apoyo */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      Material de Apoyo
                    </h3>
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
                    </div>
                    {weekContent.assignment ? (
                      <div className="space-y-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-500">Fecha de Entrega:</span>
                          <span className="font-semibold">
                            {formatInputDateToLong(weekContent.assignment.dueDate)}
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
    </div>
  );
}