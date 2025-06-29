'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { FiMenu, FiX } from 'react-icons/fi';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isTeacherRoute = pathname?.startsWith('/teacher');
  const isStudentRoute = pathname?.startsWith('/student');
  const isAdminRoute = pathname?.startsWith('/admin');
  
  const navItems = isTeacherRoute ? [
    { name: 'Dashboard', path: '/teacher' },
    { name: 'Perfil', path: '/teacher/profile' },
    { name: 'Mis Clases', path: '/teacher/classes' },
    { name: 'Crear Clase', path: '/teacher/classes/create' }
  ] : isStudentRoute ? [
    { name: 'Dashboard', path: '/student' },
    { name: 'Perfil', path: '/student/profile' },
    { name: 'Mis Clases', path: '/student/classes' },
    { name: 'Buscar Clases', path: '/student/searchclasses' },
    { name: 'Inscripciones y Pagos', path: '/student/enrollments' }
  ] : isAdminRoute ? [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Usuarios', path: '/admin/users' },
    { name: 'Clases', path: '/admin/classes' },
    { name: 'Inscripciones', path: '/admin/enrollments' },
    { name: 'Pagos Mensuales', path: '/admin/monthly-payments' }
  ] : [];

  if (!navItems.length) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 border-b border-zinc-950 bg-white dark:bg-gray-800/95 dark:border-white/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Menú móvil y logo */}
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-gray-200 mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
            
            <div className="text-xl font-bold">
              ClassNet
            </div>
          </div>

          {/* Navegación desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} className={`py-2 border-b-2 transition-colors ${pathname === item.path ? 'border-blue-500 text-blue-500' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'}`}>
                {item.name}
              </Link>
            ))}
          </div>

          {/* ThemeToggle con margen de 40px */}
          <div className="flex items-center mr-10">
            <ThemeToggle className="ml-4" />
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium
                  ${pathname === item.path 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600'}
                  transition-colors duration-200`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
