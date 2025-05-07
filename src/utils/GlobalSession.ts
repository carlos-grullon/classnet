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

// Obtener la sesión actual
export function getGlobalSession(): GlobalSession | null {
  return currentSession;
}

// Establecer una nueva sesión
export function setGlobalSession(session: GlobalSession | null): void {
  currentSession = session;
  
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
  if (typeof window !== 'undefined') {
    localStorage.removeItem('classnet_session');
  }
}
