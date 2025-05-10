'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  
  const isTeacherRoute = pathname?.startsWith('/teacher');
  const isStudentRoute = pathname?.startsWith('/student');
  
  const navItems = isTeacherRoute ? [
    { name: 'Dashboard', path: '/teacher/dashboard' },
    { name: 'Perfil', path: '/teacher/profile' },
    { name: 'Clases', path: '/teacher/classes' }
  ] : isStudentRoute ? [
    { name: 'Dashboard', path: '/student/dashboard' },
    { name: 'Perfil', path: '/student/profile' },
    { name: 'Mis Clases', path: '/student/classes' }
  ] : [];

  if (!navItems.length) return null;

  return (
    <nav className="fixed top-0 left-0 bottom-1 border-zinc-950 right-0 h-16 z-30 border-b bg-white dark:bg-gray-800/95">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between font-bold">
        {/* Logo o título */}
        <div className="text-xl">
          ClassNet
        </div>

        {/* Links de navegación */}
        <div className="flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`py-2 border-b-2 transition-colors ${
                pathname === item.path
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent hover:text-blue-500'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Espacio para el botón del menú */}
        <div className="w-6" />
        <ThemeToggle/>
      </div>
    </nav>
  );
}
