import { ObjectId } from "mongodb";

interface BaseClass {
  subjectName: string;
  startTime: string | Date;
  endTime: string | Date;
  selectedDays: string[];
  maxStudents: number;
  price: number;
  level: string;
  students: string[];
  status: 'A' | 'I' | 'C';
  created_at: Date;
  updated_at: Date;
}

export interface Class extends BaseClass {
  _id: string;
  teacher_id: string;
  subject_id: string;
  startTime: string;
  endTime: string;
}

export interface ClassDatabase extends BaseClass {
  _id: ObjectId;
  teacher_id: ObjectId;
  subject_id: ObjectId;
  teacherName: string;
  startTime: Date;
  endTime: Date;
}

export interface Subject {
  _id: string;
  category: string;
  name: string;
}