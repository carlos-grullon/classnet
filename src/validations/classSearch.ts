import { z } from 'zod';

export const SearchClassSchema = z.object({
  subject: z.string().optional(),
  teacher_id: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  level: z.string().optional(),
  days: z.array(z.string()).optional()
}).refine(data => {
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: 'El precio mínimo no puede ser mayor que el máximo',
  path: ['minPrice']
});

export type SearchClassValues = z.infer<typeof SearchClassSchema>;
