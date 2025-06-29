import { z } from 'zod';

// Esquema base para la clase (lo que se guarda en la base de datos)
export const ClassSchema = z.object({
  _id: z.string().optional(),
  teacher_id: z.string(),
  subject_id: z.string(),
  subjectName: z.string(),
  teacherName: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  selectedDays: z.array(z.string()),
  maxStudents: z.number().default(35),
  price: z.number().positive(),
  level: z.string(),
  status: z.enum(['ready_to_start', 'in_progress', 'completed', 'cancelled']).default('ready_to_start'),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
  startDate: z.date().optional(),
  durationInMonths: z.number().default(4),
  description: z.string().optional(),
  currency: z.string().default('DOP'),
  paymentFrequency: z.enum(['monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual']).default('monthly'),
  paymentDay: z.number().min(1).max(31).default(30),
  enrollmentFee: z.number().min(0).default(0)
});

// Tipo para la clase en la base de datos
export type Class = z.infer<typeof ClassSchema>;

// Esquema para el formulario de creación de clase (lo que envía el usuario)
export const ClassFormSchema = z.object({
  subject: z.object({
    _id: z.string(),
    name: z.string()
  }),
  price: z.number().positive('El precio debe ser mayor a 0'),
  level: z.string().min(1, 'Se requiere un nivel'),
  selectedDays: z.array(z.string()).min(1, 'Selecciona al menos un día'),
  startTime: z.string().min(1, 'Se requiere hora de inicio'),
  endTime: z.string().min(1, 'Se requiere hora de fin'),
  maxStudents: z.coerce.number().min(1, "Mínimo 1 estudiante").max(150, "Máximo 150 estudiantes"),
  currency: z.string().default('DOP'),
  description: z.string().optional(),
  durationWeeks: z.number().min(1, "Mínimo 1 semana").max(24, "Máximo 24 semanas").default(12)
});

// Definición explícita del tipo para React Hook Form
export interface ClassFormValues {
  subject: { _id: string; name: string };
  price: number;
  level: string;
  selectedDays: string[];
  startTime: string;
  endTime: string;
  maxStudents: number;
  currency?: string;
  description?: string;
  durationWeeks?: number;
}
