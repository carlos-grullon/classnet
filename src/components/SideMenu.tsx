'use client';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { FetchData } from '@/utils/Tools.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser } from '@/providers/UserProvider';

const ThemeIcon = () => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-5 h-5" />;
  }

  return theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />;
};

type MenuItem = {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
};

export function SideMenu({ items = [] }: { items?: MenuItem[] }) {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ocultar en rutas de login/register
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await FetchData('/api/logout', {}, 'POST');
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const defaultItems: MenuItem[] = [
    {
      icon: <ThemeIcon />,
      text: isMounted ? `Modo ${theme === 'dark' ? 'claro' : 'oscuro'}` : 'Cambiar tema',
      onClick: toggleTheme
    },
    {
      icon: <FiLogOut className="w-5 h-5" />,
      text: 'Cerrar sesión',
      onClick: handleLogout
    }
  ];

  const allItems = [...items, ...defaultItems];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="z-40 p-2 ml-3 md:ml-0 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      >
        <FiMenu className="w-6 h-6" />
      </button>

      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out 
          ${isOpen ? 'visible bg-black/20' : 'invisible'}`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`absolute top-0 right-0 h-full w-64 bg-white dark:bg-gray-700 shadow-xl transform transition-transform duration-300 ease-in-out 
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center h-16 px-4 border-b">
            <h2 className="text-lg font-semibold">Menú</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {allItems.map((item, index) => (
              <button
                key={`menu-item-${index}`}
                onClick={item.onClick}
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 active:bg-gray-300 dark:active:bg-gray-500 transition-colors"
              >
                {item.icon}
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
