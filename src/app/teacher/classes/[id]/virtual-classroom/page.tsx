'use client';

import { useState, useEffect, useRef } from 'react';
import { Tabs, Tab, TabContent } from '@/components/ui/Tabs';
import { Button } from '@/components';
import { FiEdit, FiSave } from 'react-icons/fi';
import { FetchData, ErrorMsj, SuccessMsj } from '@/utils/Tools.tsx';
import { Select, SelectItem } from '@/components/ui/Select';
import { Modal } from '@/components/Modal';
import { Input } from '@/components';
import { FiUpload } from 'react-icons/fi';
import { FileUploader } from '@/components/FileUploader';

export default function VirtualClassroom({ params }: { params: { classId: string } }) {
  const classId = params.classId;
  const [content, setContent] = useState({
    presentationContent: '',
    whatsappLink: '',
    materialLink: '',
    weekContent: {
      meetingLink: '',
      recordingLink: '',
      supportMaterials: [] as Array<{ id: string, description: string, link: string }>,
      documents: [] as string[],
      assignment: {
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        dueDate: '',
        description: '',
        hasAudio: false,
        fileLink: ''
      }
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
              meetingLink: '',
              recordingLink: '',
              supportMaterials: [],
              documents: [],
              assignment: {
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
                dueDate: '',
                description: '',
                hasAudio: false,
                fileLink: ''
              }
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
        { presentationContent: content.presentationContent }, 'POST');

      if (response.success) {
        SuccessMsj('Presentación guardada correctamente');
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
                    {content.weekContent.supportMaterials.map(material => (
                      <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <p className="font-medium">{material.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{material.link}</p>
                        </div>
                        {isEditingWeek && (
                          <Button size="sm" onClick={() => handleRemoveSupportMaterial(material.id)}>
                            Eliminar
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {content.weekContent.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-gray-600 dark:text-gray-300">{doc}</span>
                        {isEditingWeek && (
                          <Button size="sm" onClick={() => {
                            setContent({
                              ...content,
                              weekContent: {
                                ...content.weekContent,
                                documents: content.weekContent.documents.filter((_, i) => i !== index)
                              }
                            });
                          }}>
                            Eliminar
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sección Asignación */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Asignación
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-300">Entrega: {content.weekContent.assignment.dueDate}</p>
                    <Input
                      label="Descripción de la asignación"
                      value={content.weekContent.assignment.description}
                      onChange={(e) => setContent(prevState => ({ ...prevState, weekContent: { ...prevState.weekContent, assignment: { ...prevState.weekContent.assignment, description: e.target.value } } }))}
                    />
                    <Button
                      onClick={handleSaveWeekContent}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <FiSave />
                      {isSaving ? 'Guardando...' : 'Guardar'}
                    </Button>
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
            onChange={(e) => setMaterialData({...materialData, title: e.target.value})} 
          />
          <Input 
            label="Enlace" 
            value={materialData.link} 
            onChange={(e) => setMaterialData({...materialData, link: e.target.value})} 
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setMaterialType(null)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if ((materialType === 'link' && materialData.link && materialData.title) || 
                  (materialType === 'file' && materialData.link && materialData.title)) {
                setContent({
                  ...content,
                  weekContent: {
                    ...content.weekContent,
                    supportMaterials: [
                      ...content.weekContent.supportMaterials,
                      {
                        id: Date.now().toString(),
                        description: materialData.title,
                        link: materialData.link
                      }
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
                onChange={(e) => setMaterialData({...materialData, title: e.target.value})} 
              />
              <Input 
                label="Enlace" 
                value={materialData.link} 
                onChange={(e) => setMaterialData({...materialData, link: e.target.value})} 
              />
            </>
          ) : (
            <>
              <Input 
                label="Título" 
                value={materialData.title} 
                onChange={(e) => setMaterialData({...materialData, title: e.target.value})} 
              />
              <FileUploader 
                onUploadSuccess={(url) => {
                  setContent({
                    ...content,
                    weekContent: {
                      ...content.weekContent,
                      supportMaterials: [
                        ...content.weekContent.supportMaterials,
                        {
                          id: Date.now().toString(),
                          description: materialData.title,
                          link: url
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
              setContent({
                ...content,
                weekContent: {
                  ...content.weekContent,
                  supportMaterials: [
                    ...content.weekContent.supportMaterials,
                    {
                      id: Date.now().toString(),
                      description: materialData.title,
                      link: materialData.link
                    }
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
    </div>
  );
}
