'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/';
import { SubjectSearch } from '@/components';
import { TeacherSearch } from '@/components';
import { Subject } from '@/interfaces';
import { FetchData } from '@/utils/Tools.tsx';
import { SearchClassData } from '@/interfaces';



export default function StudentClasses() {
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [selectedTeacherName, setSelectedTeacherName] = useState('');
  
  const [formData, setFormData] = useState<SearchClassData>({
    subject: '',
    teacher_id: '',
    minPrice: 0,
    maxPrice: 0,
    level: '',
    days: []
  });

  const handleTeacherSelect = (teacher: {id: string; name: string}) => {
    setSelectedTeacherName(teacher.name);
    setIsTeacherModalOpen(false);
  };

  const handleSubjectSelect = (subject: { category: string; code: string; name: string }) => {
    setFormData(prev => ({...prev, subject: `${subject.category}-${subject.code}`}));
    setSelectedSubjectName(subject.name);
    setIsSubjectModalOpen(false);
  };

  const priceRanges = [
    { label: 'Menos de $10', value: '0-10' },
    { label: '$10 - $20', value: '10-20' },
    { label: '$20 - $30', value: '20-30' },
    { label: 'Más de $30', value: '30+' },
  ];

  const days = [
    { label: 'Lunes', value: '1' },
    { label: 'Martes', value: '2' },
    { label: 'Miércoles', value: '3' },
    { label: 'Jueves', value: '4' },
    { label: 'Viernes', value: '5' },
    { label: 'Sábado', value: '6' },
  ];

  const levels = [
    { label: 'Principiante', value: 'beginner' },
    { label: 'Intermedio', value: 'intermediate' },
    { label: 'Avanzado', value: 'advanced' },
  ];

  useEffect(() => {
    // Load all subjects for name lookup
    const fetchSubjects = async () => {
      try {
        const res = await FetchData('/api/subjects', {}, 'GET');
        // setAllSubjects(res.subjects || res);
      } catch (error) {
        console.error('Error loading subjects:', error);
      }
    };
    
    fetchSubjects();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Buscar Clases</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {/* Professor filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Profesor</label>
          <div className="relative">
            <input
              type="text"
              value={selectedTeacherName || ''}
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-white cursor-pointer"
              onClick={() => setIsTeacherModalOpen(true)}
              placeholder="Seleccionar profesor..."
            />
            <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <TeacherSearch 
            isOpen={isTeacherModalOpen}
            onClose={() => setIsTeacherModalOpen(false)}
            onSelect={handleTeacherSelect}
          />
        </div>
        
        {/* Subject filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Materia</label>
          <div className="relative">
            <input
              type="text"
              value={selectedSubjectName || ''}
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-white cursor-pointer"
              onClick={() => setIsSubjectModalOpen(true)}
              placeholder="Seleccionar materia..."
            />
            <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <SubjectSearch 
            isOpen={isSubjectModalOpen}
            onClose={() => setIsSubjectModalOpen(false)}
            onSelect={handleSubjectSelect}
          />
        </div>
        
        {/* Price filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Precio</label>
          <select className="w-full px-3 py-2 border rounded-md">
            <option value="">Todos</option>
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Days filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Días</label>
          <select className="w-full px-3 py-2 border rounded-md">
            <option value="">Todos</option>
            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Level filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Nivel</label>
          <select className="w-full px-3 py-2 border rounded-md">
            <option value="">Todos</option>
            {levels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end mb-4">
        <Button>Buscar</Button>
      </div>
      
      {/* Classes list will go here */}
      <div className="grid grid-cols-1 gap-4">
        {/* Class cards will be rendered here */}
      </div>
    </div>
  );
}
