import { z } from 'zod';

export const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

export const aliasSchema = z.object({
  alias: z
    .string()
    .min(3, 'Alias must be at least 3 characters')
    .max(24, 'Alias must be at most 24 characters')
    .regex(/^[a-zA-Z0-9_\s-]+$/, 'Only letters, numbers, spaces, _ and - allowed'),
});

export const registerSchema = z.object({
  email: emailSchema.shape.email,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const profileDetailsSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  alias: aliasSchema.shape.alias,
  language: z.string().min(1, 'Language is required'),
  age: z.string().min(1, 'Age is required'),
});

export type EmailFormData = z.infer<typeof emailSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type AliasFormData = z.infer<typeof aliasSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileDetailsFormData = z.infer<typeof profileDetailsSchema>;
