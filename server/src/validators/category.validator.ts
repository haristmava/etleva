import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(50),
  slug: z.string().trim().min(2).max(60),
})
export const updateCategorySchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  slug: z.string().trim().min(2).max(60).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided',
  }
)