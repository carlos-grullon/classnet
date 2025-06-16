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

export default function VirtualClassroom({ params }: { params: { classId: string } }) {
  const classId = params.classId;
  const [content, setContent] = useState({
    presentationContent: '',
    whatsappLink: '',
    materialLink: ''
  });
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [materialType, setMaterialType] = useState<'link'|'file'|null>(null);
  const [materialData, setMaterialData] = useState({
    link: '',
    title: '',
    file: null as File|null
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
          setContent(data.data);
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

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(parseInt(e.target.value));
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sección Reunión */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Reunión Semana {selectedWeek}
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-300">Link de la Reunión:</p>
                    <p className="text-gray-600 dark:text-gray-300">Link de la Grabación:</p>
                  </div>
                </div>

                {/* Sección Material de Apoyo */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Material de Apoyo
                    </h3>
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
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-600 dark:text-gray-300">Presentación.pdf</span>
                      <Button size="sm">Descargar</Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-600 dark:text-gray-300">Guía práctica.docx</span>
                      <Button size="sm">Descargar</Button>
                    </div>
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
                    <p className="text-gray-600 dark:text-gray-300">Entrega: [Fecha límite]</p>
                    <p className="text-gray-600 dark:text-gray-300">[Descripción de la asignación...]</p>
                    <Button className="w-full mt-2">Subir Tarea</Button>
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
        isOpen={materialType === 'link'} 
        onClose={() => {
          setMaterialType(null);
          setIsAddMaterialModalOpen(false);
        }}
        title="Agregar Enlace de Material"
      >
        <div className="space-y-4">
          <Input 
            label="Texto descriptivo"
            placeholder="Ej: Guía de estudio semana 1"
            value={materialData.title}
            onChange={(e) => setMaterialData({...materialData, title: e.target.value})}
          />
          
          <Input 
            label="Enlace del material"
            placeholder="https://drive.google.com/..."
            value={materialData.link}
            onChange={(e) => setMaterialData({...materialData, link: e.target.value})}
          />
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setMaterialType(null)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              // Lógica para guardar enlace
              setMaterialType(null);
              setIsAddMaterialModalOpen(false);
            }}>
              Guardar
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
          <Input 
            label="Nombre del archivo"
            placeholder="Ej: Presentación Semana 1"
            value={materialData.title}
            onChange={(e) => setMaterialData({...materialData, title: e.target.value})}
          />
          
          <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <input 
              type="file" 
              id="file-upload"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  setMaterialData({...materialData, file: e.target.files[0]});
                }
              }}
            />
            <label 
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Arrastra el archivo aquí o haz click para seleccionar
              </p>
              {materialData.file && (
                <p className="mt-2 text-sm font-medium">
                  {materialData.file.name}
                </p>
              )}
            </label>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setMaterialType(null)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              // Lógica para subir archivo
              setMaterialType(null);
              setIsAddMaterialModalOpen(false);
            }}>
              Subir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
