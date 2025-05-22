import { z } from 'zod';

export const ClassFormSchema = z.object({
  subject: z.string().min(1, 'Se requiere una materia'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  level: z.string().min(1, 'Se requiere un nivel'),
  selectedDays: z.array(z.string()).min(1, 'Selecciona al menos un día'),
  startTime: z.string().min(1, 'Se requiere hora de inicio'),
  endTime: z.string().min(1, 'Se requiere hora de fin'),
  maxStudents: z.coerce.number().min(1, "Mínimo 1 estudiante").max(150, "Máximo 150 estudiantes")
});

export type ClassFormValues = z.infer<typeof ClassFormSchema>;
