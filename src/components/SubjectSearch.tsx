'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export const subjectsData = {
  "LAN": {
    "0001": "Inglés",
    "0002": "Español",
    "0003": "Francés",
    "0004": "Alemán",
    "0005": "Italiano",
    "0006": "Portugués",
    "0007": "Chino Mandarín",
    "0008": "Chino Cantonés",
    "0009": "Japonés",
    "0010": "Coreano",
    "0011": "Ruso",
    "0012": "Árabe",
    "0013": "Hebreo",
    "0014": "Griego Moderno",
    "0015": "Griego Antiguo",
    "0016": "Neerlandés",
    "0017": "Sueco",
    "0018": "Noruego",
    "0019": "Danés",
    "0020": "Polaco",
    "0021": "Turco",
    "0022": "Hindi",
    "0023": "Lengua de Signos"
  },
  "ART": {
    "0001": "Pintura",
    "0002": "Dibujo",
    "0003": "Acuarela",
    "0004": "Dibujo Digital",
    "0005": "Ilustración",
    "0006": "Diseño Gráfico",
    "0007": "Fotografía",
    "0008": "Edición de Video",
    "0009": "Animación",
    "0010": "Diseño de Moda",
    "0011": "Diseño de Interiores",
    "0012": "Escultura",
    "0013": "Cerámica",
    "0014": "Joyería",
    "0015": "Origami",
    "0016": "Caligrafía",
    "0017": "Lettering",
    "0018": "Creación de Cómics",
    "0019": "Costura",
    "0020": "Tejido (Punto)",
    "0021": "Tejido (Ganchillo)"
  },
  "MUS": {
    "0001": "Teoría Musical",
    "0002": "Solfeo",
    "0003": "Armonía",
    "0004": "Composición Musical",
    "0005": "Canto",
    "0006": "Piano",
    "0007": "Guitarra",
    "0008": "Bajo Eléctrico",
    "0009": "Batería",
    "0010": "Violín",
    "0011": "Violonchelo",
    "0012": "Flauta",
    "0013": "Clarinete",
    "0014": "Saxofón",
    "0015": "Trompeta",
    "0016": "Ukelele",
    "0017": "Producción Musical",
    "0018": "Historia de la Música"
  },
  "DYM": {
    "0001": "Ballet",
    "0002": "Jazz (Baile)",
    "0003": "Hip Hop (Baile)",
    "0004": "Contemporáneo (Baile)",
    "0005": "Salsa",
    "0006": "Bachata",
    "0007": "Tango",
    "0008": "Flamenco",
    "0009": "Yoga",
    "0010": "Pilates",
    "0011": "Zumba",
    "0012": "Aeróbicos",
    "0013": "Estiramientos",
    "0014": "Conciencia Corporal"
  },
  "ACA": {
    "0001": "Matemáticas",
    "0002": "Física",
    "0003": "Química",
    "0004": "Biología",
    "0005": "Ciencias Ambientales",
    "0006": "Geología",
    "0007": "Astronomía",
    "0008": "Historia",
    "0009": "Geografía",
    "0010": "Literatura",
    "0011": "Sociología",
    "0012": "Psicología",
    "0013": "Filosofía",
    "0014": "Economía",
    "0015": "Ciencias Políticas",
    "0016": "Derecho (Introducción)",
    "0017": "Lógica",
    "0018": "Ética"
  },
  "TEC": {
    "0001": "Introducción a la Programación",
    "0002": "Programación con Python",
    "0003": "Programación con JavaScript",
    "0004": "Programación con Java",
    "0005": "Programación con C#",
    "0006": "Desarrollo Web (Frontend)",
    "0007": "Desarrollo Web (Backend)",
    "0008": "Bases de Datos (SQL)",
    "0009": "Desarrollo de Apps Móviles",
    "0010": "Ciencia de Datos (Introducción)",
    "0011": "Inteligencia Artificial (Introducción)",
    "0012": "Ciberseguridad (Introducción)",
    "0013": "Redes de Computadoras (Introducción)",
    "0014": "Cloud Computing (Introducción)",
    "0015": "Diseño UX/UI",
    "0016": "Control de Versiones (Git)",
    "0017": "Ofimática (Word)",
    "0018": "Ofimática (Excel)",
    "0019": "Ofimática (PowerPoint)"
  },
  "HAB": {
    "0001": "Cocina",
    "0002": "Repostería",
    "0003": "Jardinería",
    "0004": "Ajedrez",
    "0005": "Escritura Creativa",
    "0006": "Guionismo",
    "0007": "Podcasting",
    "0008": "Blogging",
    "0009": "Oratoria",
    "0010": "Finanzas Personales",
    "0011": "Organización del Hogar",
    "0012": "Coaching",
    "0013": "Mindfulness",
    "0014": "Meditación"
  }
} as const;

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

const getAllSubjects = (data: typeof subjectsData): Subject[] => {
  const allSubjects: Subject[] = [];
  
  for (const [category, subjects] of Object.entries(data)) {
    for (const [code, name] of Object.entries(subjects)) {
      allSubjects.push({
        code: `${category}${code}`,
        name,
        category
      });
    }
  }
  
  return allSubjects;
};

const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const allSubjectsFlat = getAllSubjects(subjectsData);

export const SubjectSearch: React.FC<SubjectSearchProps> = ({ 
  onSubjectSelect, 
  value = '', 
  className = '' 
}) => {
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
  }, [searchTerm]);

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