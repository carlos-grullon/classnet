'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface Subject {
  code: string;
  name: string;
  category: string;
}

interface SubjectSearchProps {
  onSubjectSelect?: (subjectCode: string) => void;
  value?: string;
  className?: string;
}

export const SubjectSearch: React.FC<SubjectSearchProps> = ({ 
  onSubjectSelect, 
  value = '', 
  className = '' 
}) => {
  const [subjectsData, setSubjectsData] = useState<Record<string, Record<string, string>>>({});
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/subjects');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setSubjectsData(data);
      } catch (error) {
        console.error('Failed to load subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  const getAllSubjects = (data: typeof subjectsData): Subject[] => {
    return Object.entries(data).flatMap(([category, subjects]) => 
      Object.entries(subjects).map(([code, name]) => ({
        code: `${category}-${code}`,
        name,
        category
      }))
    );
  };

  const normalizeText = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const allSubjectsFlat = useMemo(() => getAllSubjects(subjectsData), [subjectsData]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(
    value ? allSubjectsFlat.find(s => s.code === value) || null : null
  );
  const searchRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) return []; // Return empty array when search is empty

    const normalizedTerm = normalizeText(searchTerm);
    return allSubjectsFlat.filter(subject =>
      normalizeText(subject.name).includes(normalizedTerm) ||
      normalizeText(subject.code).includes(normalizedTerm) ||
      normalizeText(subject.category).includes(normalizedTerm)
    ).slice(0, 10);
  }, [searchTerm, allSubjectsFlat]);

  const handleSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    onSubjectSelect?.(subject.code);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedSubject(null);
    setSearchTerm('');
    onSubjectSelect?.('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear selection when input is empty
    if (value === '' && selectedSubject) {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={selectedSubject ? `${selectedSubject.name} (${selectedSubject.code})` : searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedSubject ? '' : 'Buscar materias...'}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {selectedSubject ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={20} />
          </button>
        ) : (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
            ⌘K
          </div>
        )}
      </div>

      {isOpen && searchTerm && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60">
          {filteredSubjects.length === 0 ? (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-300">
              No se encontraron materias
            </div>
          ) : (
            filteredSubjects.map((subject) => (
              <div
                key={`${subject.category}-${subject.code}`}
                onClick={() => handleSelect(subject)}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  {subject.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {subject.code} • {subject.category}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};