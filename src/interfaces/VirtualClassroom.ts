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

export interface WeekContent {
  meetingLink: string;
  recordingLink: string;
  supportMaterials: SupportMaterial[];
  assignment: Assignment | null;
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
    selectedDays: string;
    startTime: string;
    endTime: string;
    price: number;
  };
  welcomeMessage: string;
  whatsappLink: string;
  resources: SupportMaterial[];
  durationWeeks: number;
}

export interface StudentAssignment {
  fileUrl: string | null;
  fileName: string | null;
  audioUrl: string | null;
  message: string;
  fileSubmission: {
    submittedAt: string | Date | null;
    isGraded: boolean;
    grade: number | null;
  };
  audioSubmission: {
    submittedAt: string | Date | null;
    isGraded: boolean;
    grade: number | null;
  };
}