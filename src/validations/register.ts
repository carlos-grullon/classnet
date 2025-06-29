import { z } from 'zod';

export const RegisterFormSchema = z.object({
  username: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Requerido'),
  password: z.string()
    .min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string()
    .min(1, 'Confirma tu contraseña'),
  user_type: z.enum(['E', 'P'])
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;
