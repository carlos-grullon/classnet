import { ObjectId } from "mongodb";

interface BaseClass {
  subjectName?: string;
  teacherName?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  selectedDays?: string[];
  maxStudents?: number;
  price: number;
  level: string;
  status: 'ready_to_start' | 'in_progress' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
  durationWeeks: number;
  startDate: Date | string;
  currency: string;
}

export interface Class extends BaseClass {
  _id: string;
  teacher_id: string;
  subject_id: string;
  students_enrolled: number;
}
  

export interface ClassDatabase extends BaseClass {
  _id: ObjectId;
  teacher_id: ObjectId;
  subject_id: ObjectId;
  startTime: Date;
  endTime: Date;
}

export interface Subject {
  _id: string;
  category: string;
  name: string;
}