'use client';

import Link from 'next/link';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { PiStudentFill } from 'react-icons/pi';

export default function Home() {

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8" >Bienvenido a ClassNet</h1>
        <p className="mb-12" >Por favor, selecciona tu tipo de usuario</p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/teacher/dashboard" 
            className="flex items-center bg-blue-400 justify-center gap-3 px-8 py-4 
            rounded-lg transform hover:scale-105 text-black transition-all duration-200 shadow-lg">
            <FaChalkboardTeacher className="h-6 w-6" />
            Profesor
          </Link>

          <Link href="/student/dashboard"
            className="flex items-center bg-amber-400 justify-center gap-3 px-8 
            py-4 rounded-lg transform hover:scale-105 transition-all text-black
            duration-200 shadow-lg">
            <PiStudentFill className="h-6 w-6" />
            Estudiante
          </Link>
        </div>
      </div>
    </div>
  );
}
