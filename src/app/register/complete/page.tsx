'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FiUserPlus, FiMail, FiUser } from 'react-icons/fi';
import { FetchData } from '@/utils/Tools.tsx';
import Image from 'next/image';
import { ThemeToggle } from '@/components';
import { useUser } from '@/providers/UserProvider';

export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CompleteRegistrationContent />
    </Suspense>
  );
}

function CompleteRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';
  const picture = searchParams.get('picture') || '';
  
  const [userType, setUserType] = useState<'E' | 'P' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) {
      setError('Por favor selecciona si eres estudiante o profesor');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await FetchData<{success: boolean, message: string}>('/api/auth/google/register', {
        email,
        username: name,
        user_type: userType,
        image_path: picture
      });
      
      if (result.success) {
        setUser({
          userIsStudent: userType === 'E',
          userIsTeacher: userType === 'P',
          userEmail: email,
          userImage: picture,
          userName: name,
          userNumber: ''
        });
        router.push(userType === 'P' ? '/teacher' : '/student');
      } else {
        setError(result.message || 'Error al completar el registro');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al completar el registro';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <ThemeToggle className="fixed top-4 right-4" />
      <Card 
        title="Completar Registro" 
        icon={<FiUserPlus className="text-blue-500" />}
        variant="elevated"
        className="max-w-md w-full"
      >
        <div className="mb-6 flex flex-col items-center">
          {picture && (
            <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-blue-100 dark:border-blue-900 shadow-md">
              <Image 
                src={picture} 
                alt={name || 'Perfil'} 
                fill 
                className="object-cover" 
                sizes="96px"
              />
            </div>
          )}
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{name}</h3>
            <div className="flex items-center justify-center mt-1 text-gray-500 dark:text-gray-400">
              <FiMail className="mr-1" />
              <span className="text-sm">{email}</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-3 flex items-center">
              <FiUser className="mr-2" />
              Selecciona tu rol en ClassNet
            </h4>
            
            <div className="flex flex-col space-y-3 mt-3">
              <label className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white hover:border-blue-500 dark:hover:border-blue-500 dark:bg-gray-800 cursor-pointer transition-colors duration-200 shadow-sm">
                <input
                  type="radio"
                  name="userType"
                  value="E"
                  checked={userType === 'E'}
                  onChange={() => setUserType('E')}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-gray-800 dark:text-gray-200 font-medium block">Estudiante</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Accede a cursos y contenido educativo</span>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white hover:border-blue-500 dark:hover:border-blue-500 dark:bg-gray-800 cursor-pointer transition-colors duration-200 shadow-sm">
                <input
                  type="radio"
                  name="userType"
                  value="P"
                  checked={userType === 'P'}
                  onChange={() => setUserType('P')}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-gray-800 dark:text-gray-200 font-medium block">Profesor</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Crea cursos y gestiona contenido educativo</span>
                </div>
              </label>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isLoading || !userType}
              isLoading={isLoading}
              fullWidth
            >
              {isLoading ? 'Procesando...' : 'Completar Registro'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
