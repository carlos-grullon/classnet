'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  const currentTheme = theme === 'system' ? 'system' : theme;
  return (
    <button
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      className={className + " hover:rotate-[-15deg] transition-transform p-1 hover:bg-gray-400 dark:hover:bg-gray-700 rounded-full"}
    >
      {currentTheme === 'dark' ? 
      <FiSun className="w-10 h-10" /> : 
      <FiMoon className="w-10 h-10" />}
    </button>
  );
}