'use client';

import { useUser } from '@/providers/UserProvider';
import Image from 'next/image';

export default function StudentInfo() {
  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-4">
        <p className="text-red-600 dark:text-red-400">Error al cargar la información del estudiante</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <Image 
            width={64}
            height={64}
            className="rounded-full" 
            src={user?.userImage || '/default-avatar.png'} 
            alt={`Avatar de ${user?.userName || 'estudiante'}`}
            priority
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {user?.userName || 'Estudiante'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {user?.userEmail || 'No especificado'}
          </p>
        </div>
      </div>
    </div>
  );
}
