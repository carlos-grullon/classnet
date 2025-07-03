'use client';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { BiLogOut } from 'react-icons/bi';
import { FetchData } from '@/utils/Tools.tsx';
import { useRouter, usePathname } from 'next/navigation';

export function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Ocultar en rutas de login/register
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await FetchData('/api/logout');
      setIsOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      {/* Botón del menú */}      <button
        onClick={() => setIsOpen(true)}
        className="z-40 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menú lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out shadow-lg ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Cabecera del menú */}
        <div className="flex justify-between items-center h-16 px-4 border-b">
          <h2 className="text-lg font-semibold">Menú</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        {/* Contenido del menú */}
        <div className="p-4 space-y-4">
          {/* Botón de logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <BiLogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}
