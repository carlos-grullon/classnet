'use client';
import Link from 'next/link';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { PiStudentFill } from 'react-icons/pi';
import { LeerCookie } from '@/utils/Tools.tsx';

// Verificar que el tipo de usuario sea profesor y estudiante
// async function verificarTipoUsuario() {
//     const sessionId = LeerCookie('sessionId');
//     if (!sessionId) {
//         return;
//     }
//     const response = await fetch('/api/verify-session', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ sessionId }),
//     });
//     const data = await response.json();
//     if (!response.ok) {
//         throw new Error(data.error || 'Error al verificar la sesión');
//     }
//     return data.userType;
// }

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--foreground)' }}>Bienvenido a ClassNet</h1>
        <p className="mb-12" style={{ color: 'var(--foreground-muted)' }}>Por favor, selecciona tu tipo de usuario</p>
        
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
