// src/shared/validators/auth.validator.ts

import { z } from 'zod';

// Validador para login
export const loginSchema = z.object({
  username: z.string()
    .min(1, 'El username/email es requerido')
    .max(255, 'El username/email no puede exceder 255 caracteres')
    .refine((value) => {
      // Validar que sea un email válido o un username
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const usernameRegex = /^[a-zA-Z0-9._-]+$/;
      return emailRegex.test(value) || usernameRegex.test(value);
    }, 'Debe ser un email válido o un username válido'),
  
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(255, 'La contraseña no puede exceder 255 caracteres')
});

// Validador para registro
export const registerSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Debe ser un email válido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(255, 'La contraseña no puede exceder 255 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  
  phone: z.string()
    .min(1, 'El teléfono es requerido')
    .regex(/^\+\d{1,4}\d{6,15}$/, 'El teléfono debe incluir código de país (ej: +51987654321)'),
  
  role: z.enum(['admin', 'manager', 'employee'], {
    message: 'El rol debe ser admin, manager o employee'
  }),
  
  companyId: z.string()
    .min(1, 'El ID de la empresa es requerido'),
  
  areaId: z.string()
    .min(1, 'El ID del área es requerido')
});

// Validador para login por teléfono
export const phoneLoginSchema = z.object({
  phone: z.string()
    .min(1, 'El número de teléfono es requerido')
    .regex(/^\+\d{1,4}\d{6,15}$/, 'El teléfono debe incluir código de país (ej: +51987654321)')
});

// Tipos TypeScript generados desde los schemas
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type PhoneLoginRequest = z.infer<typeof phoneLoginSchema>;
