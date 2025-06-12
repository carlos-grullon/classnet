'use client';

import { Tabs, Tab, TabContent } from '@/components/ui/Tabs';

export default function VirtualClassroom({ params }: { params: { classId: string } }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Aula Virtual</h1>
      
      <Tabs defaultActiveId="content">
        {(activeId, setActiveId) => (
          <>
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <Tab 
                id="content" 
                activeId={activeId} 
                setActiveId={setActiveId}
                className="px-4 py-2 font-medium text-sm focus:outline-none"
              >
                Contenido
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
            
            <TabContent id="content" activeId={activeId} className="mt-2">
              <div className="p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Material de la clase</h2>
              </div>
            </TabContent>
            
            <TabContent id="students" activeId={activeId} className="mt-2">
              <div className="p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Estudiantes inscritos</h2>
              </div>
            </TabContent>
            
            <TabContent id="resources" activeId={activeId} className="mt-2">
              <div className="p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Recursos compartidos</h2>
              </div>
            </TabContent>
            
            <TabContent id="chat" activeId={activeId} className="mt-2">
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
