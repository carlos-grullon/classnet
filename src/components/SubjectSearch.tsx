// src/app/components/SubjectSearch.tsx
'use client'; // Este componente se ejecutará en el cliente

import React, { useState, useMemo } from 'react';
import { FiLoader } from 'react-icons/fi';

// Incluimos la data JSON directamente aquí para este ejemplo
const subjectsData = {
  "MateriasOnlineBasicas": {
    "Idiomas": [
      "Inglés",
      "Español",
      "Francés",
      "Alemán",
      "Italiano",
      "Portugués",
      "Chino Mandarín",
      "Chino Cantonés",
      "Japonés",
      "Coreano",
      "Ruso",
      "Árabe",
      "Hebreo",
      "Griego Moderno",
      "Griego Antiguo",
      "Neerlandés",
      "Sueco",
      "Noruego",
      "Danés",
      "Polaco",
      "Turco",
      "Hindi",
      "Lengua de Signos"
    ],
    "Artes y Manualidades": [
      "Pintura",
      "Dibujo",
      "Acuarela",
      "Dibujo Digital",
      "Ilustración",
      "Diseño Gráfico",
      "Fotografía",
      "Edición de Video",
      "Animación",
      "Diseño de Moda",
      "Diseño de Interiores",
      "Escultura",
      "Cerámica",
      "Joyería",
      "Origami",
      "Caligrafía",
      "Lettering",
      "Creación de Cómics",
      "Costura",
      "Tejido (Punto)",
      "Tejido (Ganchillo)"
    ],
    "Música": [
      "Teoría Musical",
      "Solfeo",
      "Armonía",
      "Composición Musical",
      "Canto",
      "Piano",
      "Guitarra",
      "Bajo Eléctrico",
      "Batería",
      "Violín",
      "Violonchelo",
      "Flauta",
      "Clarinete",
      "Saxofón",
      "Trompeta",
      "Ukelele",
      "Producción Musical",
      "Historia de la Música"
    ],
    "Baile y Movimiento": [
      "Ballet",
      "Jazz (Baile)",
      "Hip Hop (Baile)",
      "Contemporáneo (Baile)",
      "Salsa",
      "Bachata",
      "Tango",
      "Flamenco",
      "Yoga",
      "Pilates",
      "Zumba",
      "Aeróbicos",
      "Estiramientos",
      "Conciencia Corporal"
    ],
    "Materias Académicas": [
      "Matemáticas",
      "Física",
      "Química",
      "Biología",
      "Ciencias Ambientales",
      "Geología",
      "Astronomía",
      "Historia",
      "Geografía",
      "Literatura",
      "Sociología",
      "Psicología",
      "Filosofía",
      "Economía",
      "Ciencias Políticas",
      "Derecho (Introducción)",
      "Lógica",
      "Ética"
    ],
    "Tecnología y Programación": [
      "Introducción a la Programación",
      "Programación con Python",
      "Programación con JavaScript",
      "Programación con Java",
      "Programación con C#",
      "Desarrollo Web (Frontend)",
      "Desarrollo Web (Backend)",
      "Bases de Datos (SQL)",
      "Desarrollo de Apps Móviles",
      "Ciencia de Datos (Introducción)",
      "Inteligencia Artificial (Introducción)",
      "Ciberseguridad (Introducción)",
      "Redes de Computadoras (Introducción)",
      "Cloud Computing (Introducción)",
      "Diseño UX/UI",
      "Control de Versiones (Git)",
      "Ofimática (Word)",
      "Ofimática (Excel)",
      "Ofimática (PowerPoint)"
    ],
    "Habilidades y Hobbies": [
      "Cocina",
      "Repostería",
      "Jardinería",
      "Ajedrez",
      "Escritura Creativa",
      "Guionismo",
      "Podcasting",
      "Blogging",
      "Oratoria",
      "Finanzas Personales",
      "Organización del Hogar",
      "Coaching",
      "Mindfulness",
      "Meditación"
    ]
  }
};

// Función para obtener una lista plana de todas las materias para facilitar el filtrado
const getAllSubjects = (data: typeof subjectsData) => {
  const allSubjects: string[] = [];
  for (const category in data.MateriasOnlineBasicas) {
    // Asegurarse de que la propiedad es propia del objeto y es un array
    if (Object.hasOwnProperty.call(data.MateriasOnlineBasicas, category) && Array.isArray(data.MateriasOnlineBasicas[category as keyof typeof data.MateriasOnlineBasicas])) {
       const subjectsInCategory = data.MateriasOnlineBasicas[category as keyof typeof data.MateriasOnlineBasicas];
       allSubjects.push(...subjectsInCategory); // Añadir todas las materias de la categoría a la lista plana
    }
  }
  return allSubjects;
};

// Función para normalizar texto (eliminar acentos y caracteres especiales)
const normalizeText = (text: string) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const allSubjectsFlat = getAllSubjects(subjectsData); // Obtenemos la lista plana al inicio

interface SubjectSearchProps {
  onSubjectSelect?: (subject: string) => void;
}

const SubjectSearch: React.FC<SubjectSearchProps> = ({ onSubjectSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Optimización con useMemo
  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) return allSubjectsFlat;
    
    const normalizedTerm = normalizeText(searchTerm);
    return allSubjectsFlat.filter(subject => 
      normalizeText(subject).includes(normalizedTerm)
    );
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar materias..."
          className="w-full p-2 border rounded-lg"
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <FiLoader className="animate-spin" />
          </div>
        )}
      </div>

      {filteredSubjects.length === 0 ? (
        <p className="text-gray-500">No se encontraron materias</p>
      ) : (
        <div className="max-h-60 overflow-y-auto border rounded-lg">
          {filteredSubjects.map((subject) => (
            <div 
              key={subject} 
              onClick={() => {
                onSubjectSelect?.(subject);
              }}
              className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {subject}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectSearch;