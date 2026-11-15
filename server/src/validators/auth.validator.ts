import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),

  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long'),
})

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),

  password: z
    .string()
    .min(1, 'Password is required'),
})
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),

  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
})
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),

  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(72, 'New password is too long'),
})