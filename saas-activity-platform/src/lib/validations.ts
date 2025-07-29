import { z } from 'zod';

// Esquemas de validación para formularios
export const loginSchema = z.object({
  username: z.string()
    .min(1, 'El username es requerido')
    .max(255, 'El username no puede exceder 255 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const createUserSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().min(7, 'El teléfono debe incluir el código de país y al menos 7 dígitos'),
  role: z.enum(['super_admin', 'company_admin', 'operator', 'user']),
  companyId: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  phone: z.string().min(7, 'El teléfono debe incluir el código de país y al menos 7 dígitos').optional(),
  role: z.enum(['super_admin', 'company_admin', 'operator', 'user']).optional(),
  isActive: z.boolean().optional(),
});

export const createCompanySchema = z.object({
  name: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
  domain: z.string().min(2, 'El dominio debe tener al menos 2 caracteres'),
  adminEmail: z.string().email({ message: 'Email del administrador inválido' }),
  adminName: z.string().min(2, 'El nombre del administrador debe tener al menos 2 caracteres'),
  adminPassword: z.string().min(6, 'La contraseña del administrador debe tener al menos 6 caracteres'),
  planId: z.string().min(1, 'Debes seleccionar un plan'),
  settings: z.object({
    timezone: z.string().optional(),
    workingHours: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
    allowUserSelfRegistration: z.boolean().optional(),
  }).optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres').optional(),
  domain: z.string().min(2, 'El dominio debe tener al menos 2 caracteres').optional(),
  planId: z.string().min(1, 'Debes seleccionar un plan').optional(),
  settings: z.object({
    timezone: z.string(),
    workingHours: z.object({
      start: z.string(),
      end: z.string(),
    }),
    allowUserSelfRegistration: z.boolean(),
  }).partial().optional(),
  isActive: z.boolean().optional(),
});

export const createActivitySchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  startDate: z.date({
    message: 'La fecha de inicio es requerida',
  }),
  endDate: z.date({
    message: 'La fecha de fin es requerida',
  }),
}).refine((data) => data.endDate > data.startDate, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

export const updateActivitySchema = z.object({
  title: z.string().min(1, 'El título es requerido').optional(),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

export const reportFiltersSchema = z.object({
  userId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  companyId: z.string().optional(),
});

// Tipos inferidos de los esquemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type CreateCompanyFormData = z.infer<typeof createCompanySchema>;
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>;
export type CreateActivityFormData = z.infer<typeof createActivitySchema>;
export type UpdateActivityFormData = z.infer<typeof updateActivitySchema>;
export type ReportFiltersFormData = z.infer<typeof reportFiltersSchema>;