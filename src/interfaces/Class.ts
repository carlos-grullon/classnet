export interface Class {
    _id: string;
    user_id: string;
    subject: string;
    startTime: string;
    endTime: string;
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
  code: string;
  name: string;
}