import { z } from 'zod';

export const LoginFormSchema = z.object({
  email: z.string().email('Ingresa un email válido').min(1, 'Se requiere email'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;
