'use client';

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class" 
      enableSystem={false} 
      defaultTheme="light" 
      forcedTheme={props.forcedTheme}
    >
      {children}
    </NextThemesProvider>
  );
}

export const useTheme = () => {
  const { theme, setTheme } = useNextTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
};