
import { z } from 'zod'

export const createOrderSchema = z.object({
  shippingAddress: z
    .string()
    .trim()
    .min(10, 'Shipping address must be at least 10 characters')
    .max(500, 'Shipping address is too long'),

  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),

        quantity: z
          .number()
          .int('Quantity must be an integer')
          .min(1, 'Quantity must be at least 1')
          .max(100, 'Quantity cannot exceed 100'),
      })
    )
    .min(1, 'Order must contain at least one product')
    .max(50, 'Order cannot contain more than 50 items'),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ]),
})

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  status: z.enum([
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ]).optional(),

  search: z
    .string()
    .trim()
    .max(100, 'Search query is too long')
    .optional(),
})
