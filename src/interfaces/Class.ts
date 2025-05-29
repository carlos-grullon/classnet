import { ObjectId } from "mongodb";

export interface Class {
  _id: string;
  user_id: string;
  subject: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  selectedDays: string[];
  maxStudents: number;
  price: number;
  level: string;
  teacherName: string;
  students: string[];
  status: 'A' | 'I' | 'C'; // A=Activo, I=Inactivo, C=Completado
  created_at: Date;
  updated_at: Date;
  teacher: string;
}

export interface ClassDatabase {
  _id: ObjectId;
  user_id: ObjectId;
  subject: string;
  startTime: Date;
  endTime: Date;
  selectedDays: string[];
  maxStudents: number;
  price: number;
  level: string;
  students: string[];
  status: 'A' | 'I' | 'C'; // A=Activo, I=Inactivo, C=Completado
  created_at: Date;
  updated_at: Date;
}

export interface Subject {
  _id: string;
  category: string;
  name: string;
}