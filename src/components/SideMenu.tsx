'use client';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { FiSun, FiMoon } from 'react-icons/fi';
import { BiLogOut } from 'react-icons/bi';
import { useTheme } from '@/hooks/useTheme';

export default function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      {/* Botón del menú */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        style={{ color: 'var(--foreground)' }}
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menú lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out shadow-lg ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--background)' }}
      >
        {/* Cabecera del menú */}
        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Menú</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            style={{ color: 'var(--foreground)' }}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del menú */}
        <div className="p-4 space-y-4">
          {/* Botón de tema */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            style={{ color: 'var(--foreground)' }}
          >
            {theme === 'light' ? (
              <>
                <FiMoon className="w-5 h-5" />
                <span>Modo oscuro</span>
              </>
            ) : (
              <>
                <FiSun className="w-5 h-5" />
                <span>Modo claro</span>
              </>
            )}
          </button>

          {/* Botón de logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            style={{ color: 'var(--foreground)' }}
          >
            <BiLogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}
