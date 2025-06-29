'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
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