'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Input } from '@/components';
import { FiSearch } from 'react-icons/fi';
import { Button } from '@/components';

interface TeacherSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (teacher: { id: string; name: string }) => void;
}

export function TeacherSearch({ isOpen, onClose, onSelect }: TeacherSearchProps) {
  const [teachers, setTeachers] = useState<{id: string; name: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/teachers');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      // Transform to only include id and name
      const simplifiedTeachers = (Array.isArray(data?.teachers || data) ? 
        (data?.teachers || data) : [])
        .map((teacher: {id: string; name: string}) => ({ id: teacher.id, name: teacher.name }));
      
      setTeachers(simplifiedTeachers);
    } catch (error) {
      console.error('Failed to load teachers:', error);
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar Profesor">
      <div className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar profesor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        {isLoading ? (
          <div className="text-center py-4">Cargando profesores...</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {filteredTeachers.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTeachers.map((teacher) => (
                  <li key={teacher.id} className="py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => onSelect(teacher)}
                    >
                      {teacher.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {searchTerm ? 'No se encontraron profesores' : 'No hay profesores disponibles'}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
