"use client";

import { useTheme } from "@/hooks/useTheme";
import React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div data-theme={theme}>
      <button
        onClick={toggleTheme}
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        Cambiar a modo {theme === "dark" ? "claro" : "oscuro"}
      </button>
      {children}
    </div>
  );
}