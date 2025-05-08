// src/lib/session.client.ts
'use client'; // <--- ¡ crucial !

// Definir la interfaz para la sesión
export interface GlobalSession {
  idSession: string;
  userIsStudent?: boolean;
  userIsTeacher?: boolean;
  userEmail?: string;
}

// Variable global para almacenar la sesión
let currentSession: GlobalSession | null = null;

// Inicializar la sesión desde localStorage al cargar el archivo
// Este código ahora solo se ejecutará en el navegador porque el archivo es 'use client'
try {
  const stored = localStorage.getItem('classnet_session');
  if (stored) {
    currentSession = JSON.parse(stored);
  }
} catch (error) {
  console.error('Error al cargar la sesión:', error);
}


// Obtener la sesión actual
export function getGlobalSession(): GlobalSession | null {
  return currentSession;
}

// Establecer una nueva sesión
export function setGlobalSession(session: GlobalSession | null): void {
  currentSession = session;

  if (session) {
    localStorage.setItem('classnet_session', JSON.stringify(session));
  } else {
    localStorage.removeItem('classnet_session');
  }
}

// Verificar si hay una sesión activa
export function isAuthenticated(): boolean {
  return !!currentSession;
}

// Cerrar sesión
export function clearGlobalSession(): void {
  currentSession = null;
  localStorage.removeItem('classnet_session');
}