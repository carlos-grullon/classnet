import { ObjectId } from 'mongodb';

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
_id: ObjectId | string;
  classId: ObjectId | string;
  weekNumber: number;
  content: {
    meetingLink: string;
    recordingLink: string;
    supportMaterials: SupportMaterial[];
    assignment: Assignment | null;
  };
  updatedAt: Date;
}

export interface ClassContent {
  _id: string;
  classId: string;
  teacher: {
    name: string;
    country: string;
    whatsapp: string;
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