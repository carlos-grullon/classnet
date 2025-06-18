'use client';

import { useState, useEffect, useRef } from 'react';
import { Tabs, Tab, TabContent } from '@/components/ui/Tabs';
import { Button } from '@/components';
import { FiEdit, FiSave } from 'react-icons/fi';
import { FetchData, ErrorMsj, SuccessMsj } from '@/utils/Tools.tsx';
import { Select, SelectItem } from '@/components/ui/Select';
import { Modal } from '@/components/Modal';
import { Input, Textarea } from '@/components';
import { DateInput, ToggleSwitch } from '@/components';
import { FileUploader } from '@/components/FileUploader';
import Link from 'next/link';
import { FiFileText, FiImage, FiFile, FiLink, FiAlertCircle, FiCalendar, FiVolume2 } from 'react-icons/fi';

interface SupportMaterial {
  id: string;
  description: string;
  link: string;
  fileName?: string;
}

interface Assignment {
  id?: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  description: string;
  hasAudio: boolean;
  fileLink: string;
  fileName: string;
}

interface WeekContent {
  id?: string;
  meetingLink: string;
  recordingLink: string;
  supportMaterials: SupportMaterial[];
  assignment: Assignment | null;
}

interface VirtualClassroomContent {
  id?: string;
  weekContent: WeekContent;
}

// Función para obtener el icono según el tipo de archivo
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (!extension) return <FiLink className="mr-2 text-4xl" />;

  switch (extension) {
    case 'pdf':
      return <FiFileText className="mr-2 text-red-500 text-4xl" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FiImage className="mr-2 text-blue-500 text-4xl" />;
    case 'doc':
    case 'docx':
      return <FiFileText className="mr-2 text-blue-600 text-4xl" />;
    default:
      return <FiFile className="mr-2 text-4xl" />;
  }
};

export default function VirtualClassroom({ params }: { params: { id: string } }) {
  const classId = params.id;
  const [content, setContent] = useState<VirtualClassroomContent>({
    weekContent: {
      id: '',
      meetingLink: '',
      recordingLink: '',
      supportMaterials: [] as SupportMaterial[],
      assignment: null
    }
  });
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [materialType, setMaterialType] = useState<'link' | 'file' | null>(null);
  const [materialData, setMaterialData] = useState({
    link: '',
    title: '',
    file: null as File | null
  });
  const [isEditingWeek, setIsEditingWeek] = useState(false);
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

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAddMaterialModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cargar contenido existente
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const data = await FetchData(`/api/teacher/classes/${classId}/content?week=${selectedWeek}`, {}, 'GET');
        if (data.success && data.data) {
          setContent({
            ...data.data,
            weekContent: data.data.weekContent || {
              id: '',
              meetingLink: '',
              recordingLink: '',
              supportMaterials: [],
              assignment: data.assignment || null
            }
          });
        }
      } catch (error) {
        ErrorMsj('Error cargando contenido');
        console.error('Error loading content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [classId, selectedWeek]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await FetchData(`/api/teacher/classes/${classId}/content?week=${selectedWeek}`,
        { weekContent: content.weekContent }, 'POST');

      if (response.success) {
        SuccessMsj('Contenido de la semana guardado correctamente');
        setIsEditing(false);
      } else {
        ErrorMsj(response.error || 'Error al guardar');
      }
    } catch (error: any) {
      ErrorMsj(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWeekContent = async () => {
    setIsSaving(true);
    try {
      const response = await FetchData(
        `/api/teacher/classes/${classId}/week-content?week=${selectedWeek}`,
        { weekContent: content.weekContent },
        'POST'
      );

      if (response.success) {
        SuccessMsj('Contenido de la semana guardado correctamente');
        setIsEditingWeek(false);
      } else {
        ErrorMsj(response.error || 'Error al guardar');
      }
    } catch (error: any) {
      ErrorMsj(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(parseInt(e.target.value));
  };

  const handleRemoveSupportMaterial = (id: string) => {
    setContent({
      ...content,
      weekContent: {
        ...content.weekContent,
        supportMaterials: content.weekContent.supportMaterials.filter(m => m.id !== id)
      }
    });
  };

  const handleAddAssignment = () => {
    const updatedContent = {
      ...content,
      weekContent: {
        ...content.weekContent,
        assignment: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueDate: assignmentForm.dueDate,
          description: assignmentForm.description,
          hasAudio: assignmentForm.hasAudio,
          fileLink: assignmentForm.fileLink,
          fileName: assignmentForm.fileName
        }
      }
    };
    setContent(updatedContent);
    SuccessMsj('Asignación guardada localmente');
    setIsAssignmentModalOpen(false);
  };

  const handleAssignmentFileUpload = (result: { url: string; fileName: string }) => {
    setAssignmentForm(prev => ({
      ...prev,
      fileLink: result.url,
      fileName: result.fileName
    }));
  };

  return (
    <div className="p-4">
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
                    {[1, 2, 3, 4].map(week => (
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
                id="students"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-4 py-2 font-medium text-sm focus:outline-none"
              >
                Estudiantes
              </Tab>
              <Tab
                id="resources"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-4 py-2 font-medium text-sm focus:outline-none"
              >
                Recursos
              </Tab>
              <Tab
                id="chat"
                activeId={activeId}
                setActiveId={setActiveId}
                className="px-4 py-2 font-medium text-sm focus:outline-none"
              >
                Chat
              </Tab>
            </div>

            <TabContent id="presentation" activeId={activeId} className="mt-4">
              <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Presentación del Curso</h2>
                  {isEditing ? (
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <FiSave />
                      {isSaving ? 'Guardando...' : 'Guardar'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <FiEdit />
                      Editar
                    </Button>
                  )}
                </div>
              </div>
            </TabContent>

            <TabContent id="week" activeId={activeId} className="mt-4">
              <div className="flex justify-end gap-2 mb-4">
                {isEditingWeek ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingWeek(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        console.log('Formulario enviado:', content.weekContent);
                        setIsEditingWeek(false);
                      }}
                    >
                      Guardar
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditingWeek(true)}
                    className="flex items-center gap-2"
                  >
                    <FiEdit />
                    Editar
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sección Reunión */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    Reunión Semana {selectedWeek}
                  </h3>
                  <div className="space-y-3">
                    <div className="font-medium text-center">Link de la reunión:</div>
                    <Input value={content.weekContent.meetingLink}
                      disabled={!isEditingWeek}
                      onChange={(e) => setContent({ ...content, weekContent: { ...content.weekContent, meetingLink: e.target.value } })} />
                    <div className="font-medium text-center">Link de la grabación:</div>
                    <Input value={content.weekContent.recordingLink}
                      disabled={!isEditingWeek}
                      onChange={(e) => setContent({ ...content, weekContent: { ...content.weekContent, recordingLink: e.target.value } })} />
                  </div>
                </div>

                {/* Sección Material de Apoyo */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      Material de Apoyo
                    </h3>
                    {isEditingWeek && (
                      <div className="relative" ref={menuRef}>
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
                          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
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
                    )}
                  </div>
                  <div className="space-y-3">
                    {content.weekContent.supportMaterials.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-4">
                        <FiAlertCircle className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Nada por aquí...</span>
                      </div>
                    ) : (
                      content.weekContent.supportMaterials.map(material => (
                        <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="flex items-center gap-2">
                            {getFileIcon(material.link)}
                            <div>
                              <p className="font-medium">{material.description}</p>
                              {material.fileName && (
                                <Link href={material.link} target="_blank" className="text-blue-500 hover:underline text-sm">
                                  {material.fileName}
                                </Link>
                              )}
                            </div>
                          </div>
                          {isEditingWeek && (
                            <Button size="sm" onClick={() => handleRemoveSupportMaterial(material.id)}>
                              Eliminar
                            </Button>
                          )}
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
                      {isEditingWeek && (
                        <Button size="sm" variant="outline" onClick={() => setIsAssignmentModalOpen(true)}>
                          <FiEdit className="mr-1" /> Editar
                        </Button>
                      )}
                    </div>
                    {content.weekContent.assignment ? (
                      <div className="space-y-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-500">Fecha de Entrega:</span>
                          <span className="font-semibold">
                            {content.weekContent.assignment.dueDate}
                          </span>
                        </div>
                        {content.weekContent.assignment.fileLink && (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-500">Archivo:</span>
                            <Link
                              href={content.weekContent.assignment.fileLink}
                              target="_blank"
                              className="text-blue-500 hover:underline"
                            >
                              {content.weekContent.assignment.fileName}
                            </Link>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={content.weekContent.assignment.hasAudio}
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
              <div className="p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Estudiantes inscritos</h2>
              </div>
            </TabContent>

            <TabContent id="resources" activeId={activeId} className="mt-4">
              <div className="p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Recursos compartidos</h2>
              </div>
            </TabContent>

            <TabContent id="chat" activeId={activeId} className="mt-4">
              <div className="p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Chat de la clase</h2>
              </div>
            </TabContent>
          </>
        )}
      </Tabs>

      {/* Modal para enlace */}
      <Modal
        isOpen={materialType === 'link' && isEditingWeek}
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
                
                setContent({
                  ...content,
                  weekContent: {
                    ...content.weekContent,
                    supportMaterials: [
                      ...content.weekContent.supportMaterials.map(m => ({
                        ...m,
                        fileName: m.fileName || m.link.split('/').pop() || 'Link'
                      })),
                      newMaterial
                    ]
                  }
                });
                
                setMaterialData({ link: '', title: '', file: null });
                setMaterialType(null);
                setIsAddMaterialModalOpen(false);
              }
            }}>
              Subir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para archivo */}
      <Modal
        isOpen={materialType === 'file' && isEditingWeek}
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
                onUploadSuccess={({ url, fileName }) => {
                  setContent({
                    ...content,
                    weekContent: {
                      ...content.weekContent,
                      supportMaterials: [
                        ...content.weekContent.supportMaterials,
                        {
                          id: Date.now().toString(),
                          description: materialData.title || fileName || 'Documento',
                          link: url,
                          fileName: fileName
                        }
                      ]
                    }
                  });
                  setMaterialData({ link: '', title: '', file: null });
                  setMaterialType(null);
                  setIsAddMaterialModalOpen(false);
                  SuccessMsj('Material agregado correctamente');
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
                
              setContent({
                ...content,
                weekContent: {
                  ...content.weekContent,
                  supportMaterials: [
                    ...content.weekContent.supportMaterials.map(m => ({
                      ...m,
                      fileName: m.fileName || m.link.split('/').pop() || 'Link'
                    })),
                    newMaterial
                  ]
                }
              });
                
              setMaterialData({ link: '', title: '', file: null });
              setMaterialType(null);
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
        title={content.weekContent.assignment ? 'Editar Asignación' : 'Agregar Asignación'}
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