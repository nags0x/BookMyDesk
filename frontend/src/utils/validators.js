import { z } from 'zod'

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Invalid email address'),
  password:        z.string().min(4, 'Password must be at least 4 characters'),
  confirmPassword: z.string(),
  role:            z.enum(['USER', 'ADMIN']),
  batchId:         z.number().int().min(1).max(2).optional(),
  squadNo:         z.number().int().min(1).max(5).optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine(d => d.role !== 'USER' || (d.batchId && d.squadNo), {
  message: 'Batch and squad are required for members',
  path: ['batchId'],
})

export const bookingSchema = z.object({
  date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  seatType: z.enum(['GUARANTEED', 'BUFFER']),
})

export const configSchema = z.object({
  guaranteedSeats: z.number().int().min(1).max(100),
  bufferSeats:     z.number().int().min(1).max(100),
  cycleStart:      z.string(),
  timezone:        z.string(),
  checkInDeadline: z.string(),
  bookingClose:    z.string(),
  bufferOpen:      z.string(),
})
