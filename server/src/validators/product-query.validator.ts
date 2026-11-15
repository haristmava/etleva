import { z } from 'zod'

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().max(100, 'Search query is too long').optional(),

  categoryId: z.string().uuid().optional(),

  sortBy: z.enum(['price', 'createdAt', 'name']).default('createdAt'),

  order: z.enum(['asc', 'desc']).default('desc'),

  isActive: z.enum(['true', 'false']).transform(value => value === 'true').optional(),

  isNew: z.enum(['true', 'false']).transform(value => value === 'true').optional(),

  inStock: z.enum(['true', 'false']).transform(value => value === 'true').optional(),
})
