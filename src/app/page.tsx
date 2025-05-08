'use client';

import Link from 'next/link';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { PiStudentFill } from 'react-icons/pi';
import { getGlobalSession } from '@/utils/GlobalSession';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const sessionValue = getGlobalSession();
    
    if (sessionValue) {
      if (sessionValue.userIsStudent && sessionValue.userIsTeacher) {
      } else if (sessionValue.userIsStudent) {
        router.push('/student/dashboard');
        return;
      } else if (sessionValue.userIsTeacher) {
        router.push('/teacher/dashboard');
        return;
      }
    } else {
    }
    
    setLoading(false);
  }, [router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
