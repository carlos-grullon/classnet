"use client";

import { useTheme } from "@/hooks/useTheme";
import React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div data-theme={theme}>
      {children}
    </div>
  );
}