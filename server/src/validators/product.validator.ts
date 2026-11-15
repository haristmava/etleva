
import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(100),

  slug: z.string().trim().min(2).max(120),

  description: z.string().trim().min(10),

  price: z.number().positive(),

  stock: z.number().int().min(0).default(0),

  image: z.string().url().nullable().optional(),

  isNew: z.boolean().default(false),

  isActive: z.boolean().default(true),

  categoryId: z.string().uuid(),
})
export const updateProductSchema = createProductSchema.partial()