export interface SupportMaterial {
  id: string;
  description: string;
  link: string;
  fileName?: string;
}

export interface Assignment {
  id?: string;
  dueDate: string | Date;
  description: string;
  hasAudio: boolean;
  fileLink: string;
  fileName: string;
}

// Nuevo: contenido por día dentro de una semana
export interface WeekDayContent {
  // Día de la semana como string numérico: "1"=Lunes ... "7"=Domingo
  day: string;
  // Objetivo del día
  objective: string;
  meetingLink: string;
  recordingLink: string;
  supportMaterials: SupportMaterial[];
  assignment: Assignment | null;
}

export interface WeekContent {
  // Nuevo: semana a la que pertenece (opcional por compatibilidad)
  weekNumber?: number;
  // Nuevo: arreglo de contenidos por día
  content?: WeekDayContent[];
  // Campos legacy (mantener temporalmente por compatibilidad con páginas antiguas)
  meetingLink?: string;
  recordingLink?: string;
  supportMaterials?: SupportMaterial[];
  assignment?: Assignment | null;
}

export interface ClassContent {
  _id: string;
  classId: string;
  teacher: {
    name: string;
    country: string;
    number: string;
    email: string;
    photo: string;
  };
  class: {
    name: string;
    level: string;
    // selectedDays formateado ("Lunes, Miércoles")
    selectedDays: string;
    // Nuevo: arreglo crudo de días seleccionados ("1".."7")
    selectedDaysRaw?: string[];
    startTime: string;
    endTime: string;
    price: number;
    whatsappLink: string;
  };
  welcomeMessage: string;
  resources: SupportMaterial[];
  durationWeeks: number;
}