import { z } from 'zod';

export const SearchClassSchema = z.object({
  subject: z.string(),
  teacher_id: z.string(),
  minPrice: z.number().min(0),
  maxPrice: z.number().min(0),
  level: z.string(),
  days: z.array(z.string())
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
