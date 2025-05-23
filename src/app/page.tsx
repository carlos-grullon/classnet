'use client';

import Link from 'next/link';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { PiStudentFill } from 'react-icons/pi';
import { useEffect, useState } from 'react';
import { FetchData } from '@/utils/Tools.tsx';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const user = await FetchData('/api/usertype');
        if (user.isTeacher && user.isStudent) {
          setIsLoading(false);
          return;
        }
        if (user.isTeacher) {
          router.push('/teacher');
        } else if (user.isStudent) {
          router.push('/student');
        }
      } catch (error) {
        console.error('Error al obtener tipo de usuario:', error);
      }
    };
    fetchUserType();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Cargando...</h1>
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8" >Bienvenido a ClassNet</h1>
        <p className="mb-12" >Por favor, selecciona tu tipo de usuario</p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/teacher" 
            className="flex items-center bg-blue-400 justify-center gap-3 px-8 py-4 
            rounded-lg transform hover:scale-105 text-black transition-all duration-200 shadow-lg">
            <FaChalkboardTeacher className="h-6 w-6" />
            Profesor
          </Link>

          <Link href="/student"
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
