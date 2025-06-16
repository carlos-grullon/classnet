'use client';

import { useState, useEffect } from 'react';
import { Tabs, Tab, TabContent } from '@/components/ui/Tabs';
import { Button } from '@/components';
import { FiEdit, FiSave } from 'react-icons/fi';
import { FetchData, ErrorMsj, SuccessMsj } from '@/utils/Tools.tsx';
import { Select, SelectItem } from '@/components/ui/Select';

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
                <div className="relative">
                  <Select 
                    value={selectedWeek.toString()}
                    onChange={handleWeekChange}
                    className="pr-3"
                  >
                    {[1, 2, 3].map(week => (
                      <SelectItem key={week} value={week.toString()}>
                        Semana {week}
                      </SelectItem>
                    ))}
                  </Select>
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
              <div className="p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Contenido de la semana {selectedWeek}</h2>
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
    </div>
  );
}
