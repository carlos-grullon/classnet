'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Input } from '@/components';
import { FiSearch } from 'react-icons/fi';
import { FetchData } from '@/utils/Tools.tsx';

interface TeacherSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (teacher: { id: string; name: string }) => void;
}

export function TeacherSearch({ isOpen, onClose, onSelect }: TeacherSearchProps) {
  const [teachers, setTeachers] = useState<{ _id: string; username: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    try {
      const data = await FetchData<{success: boolean, teachers: { _id: string; username: string }[]}>('/api/teacher', { userName: searchTerm, onlyNameAndId: true }, "POST");
      setTeachers(data.teachers);
    } catch (error) {
      console.error('Failed to load teachers:', error);
      setTeachers([]);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar Profesor">
      <div className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar profesor..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.currentTarget.value)}
            onKeyUp={() => fetchTeachers()}
            className="pl-10"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredTeachers.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTeachers.map((teacher) => (
                <li key={teacher._id} className="py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => onSelect({ id: teacher._id, name: teacher.username })}
                  >
                    {teacher.username}
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
      </div>
    </Modal>
  );
}
