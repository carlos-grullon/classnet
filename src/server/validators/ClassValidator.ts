import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { ClassSchema } from '@/types/Class';

// Este esquema es solo para uso del servidor y extiende el esquema base
// para agregar validaciones específicas de MongoDB como ObjectId
export const ServerClassSchema = ClassSchema.extend({
  _id: z.instanceof(ObjectId).optional(),
  teacher_id: z.instanceof(ObjectId),
  subject_id: z.instanceof(ObjectId),
});

export type ServerClass = z.infer<typeof ServerClassSchema>;

// Función para convertir un objeto con strings a ObjectId para MongoDB
export function convertToServerClass(classData: any): any {
  return {
    ...classData,
    _id: classData._id ? new ObjectId(classData._id) : undefined,
    teacher_id: new ObjectId(classData.teacher_id),
    subject_id: new ObjectId(classData.subject_id),
  };
}
