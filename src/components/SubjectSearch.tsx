'use client';

import { useState, useEffect } from 'react';
import { Input, Modal } from '@/components';
import { FiSearch } from 'react-icons/fi';
import { Subject } from '@/interfaces';

interface SubjectSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (subject: { _id: string; name: string }) => void;
}

export function SubjectSearch({ isOpen, onClose, onSelect }: SubjectSearchProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen]);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/subjects');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Asegurarnos que siempre sea un array
      setSubjects(Array.isArray(data?.subjects || data) ? (data?.subjects || data) : []);
      
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setSubjects([]); // Asegurar array vacío en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubjects = (Array.isArray(subjects) ? subjects : []).filter(subject => {
    if (!subject || typeof subject !== 'object') return false;
    
    return (
      (subject.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
      (subject.category?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false)
    );
  });

  const handleSelect = (subject: Subject) => {
    onSelect({
      _id: subject._id,
      name: subject.name
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar Materia">
      <div className="space-y-4">
        <div className="relative">
          <Input
            id="subjectSearch"
            placeholder="Buscar por nombre, código o categoría"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <FiSearch className="absolute right-3 top-3 text-gray-400" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Cargando materias...</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {filteredSubjects.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                {searchTerm ? 'No se encontraron resultados' : 'No hay materias disponibles'}
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubjects.map(subject => (
                  <li key={subject._id} className="py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer rounded">
                    <button 
                      onClick={() => handleSelect(subject)}
                      className="w-full text-left"
                    >
                      <div className="font-medium">{subject.name}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}