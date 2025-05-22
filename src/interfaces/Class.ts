export interface ClassFormData {
  subject: string;
  price: number;
  level: string;
  selectedDays: string[];
  startTime: string;
  endTime: string;
  maxStudents: number;
}

export interface Subject {
  _id: string;
  category: string;
  code: string;
  name: string;
}