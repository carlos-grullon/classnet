"use client";

import { useTheme } from "@/hooks/useTheme";
import React, { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Solo renderizar el contenido después de la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitar el parpadeo durante la hidratación
  if (!mounted) {
    return null;
  }

  return (
    <div data-theme={theme}>
      {children}
    </div>
  );
}