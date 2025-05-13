// src/lib/session.client.ts
'use client'; // <--- ¡ crucial !

// Definir la interfaz para la sesión
export interface GlobalSession {
  idSession: string;
  userIsStudent?: boolean;
  userIsTeacher?: boolean;
  userEmail?: string;
  userImage?: string;
}

// Variable global para almacenar la sesión
let currentSession: GlobalSession | null = null;

// Función para inicializar la sesión - solo se ejecutará cuando se llame, no durante la importación
function initSession() {
  // Solo ejecutar en el navegador
  if (typeof window !== 'undefined') {
try {
  const stored = localStorage.getItem('classnet_session');
  if (stored) {
    currentSession = JSON.parse(stored);
  }
} catch (error) {
  console.error('Error al cargar la sesión:', error);
}
  }
}

// Inicializar solo en el cliente
if (typeof window !== 'undefined') {
  initSession();
}


// Obtener la sesión actual
export function getGlobalSession(): GlobalSession | null {
  // Asegurarse de que la sesión esté inicializada
  if (typeof window !== 'undefined' && currentSession === null) {
    initSession();
  }
  return currentSession;
}

// Establecer una nueva sesión
export function setGlobalSession(session: GlobalSession | null): void {
  currentSession = session;

  // Solo acceder a localStorage en el navegador
  if (typeof window !== 'undefined') {
    if (session) {
      localStorage.setItem('classnet_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('classnet_session');
    }
  }
}

// Verificar si hay una sesión activa
export function isAuthenticated(): boolean {
  return !!currentSession;
}

// Cerrar sesión
export function clearGlobalSession(): void {
  currentSession = null;
  
  // Solo acceder a localStorage en el navegador
  if (typeof window !== 'undefined') {
    localStorage.removeItem('classnet_session');
  }
}