// src/shared/validators/activity.validator.ts

import { z } from 'zod';

// Enum para los estados de actividad
export const ActivityStatusEnum = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);

// Validador para crear actividad
export const createActivitySchema = z.object({
  title: z.string()
    .min(1, 'El título es requerido')
    .max(255, 'El título no puede exceder 255 caracteres'),
  
  description: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  
  assignedTo: z.string()
    .uuid('El ID del usuario asignado debe ser un UUID válido')
    .optional(), // Será opcional, si no se proporciona se asigna al creador
  
  status: ActivityStatusEnum.optional().default('pending'),
  
  startTime: z.string()
    .datetime('La fecha de inicio debe tener formato ISO válido')
    .optional()
    .transform((str: string | undefined) => str ? new Date(str) : undefined),
  
  endTime: z.string()
    .datetime('La fecha de fin debe tener formato ISO válido')
    .optional()
    .transform((str: string | undefined) => str ? new Date(str) : undefined),
}).refine((data: any) => {
  // Si el estado es completed, endTime es requerido
  if (data.status === 'completed' && !data.endTime) {
    throw new Error('Para actividades completadas, la fecha de fin es requerida');
  }
  
  // Si el estado es in_progress, startTime es requerido
  if (data.status === 'in_progress' && !data.startTime) {
    throw new Error('Para actividades en progreso, la fecha de inicio es requerida');
  }
  
  // Si el estado es completed, startTime es requerido
  if (data.status === 'completed' && !data.startTime) {
    throw new Error('Para actividades completadas, la fecha de inicio es requerida');
  }
  
  // Si se proporcionan ambas fechas, startTime debe ser anterior a endTime
  if (data.startTime && data.endTime && data.startTime >= data.endTime) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
  }
  
  // Si el estado es pending y se proporciona startTime, debe ser en el futuro (solo si no está completada)
  if (data.status === 'pending' && data.startTime && data.startTime <= new Date()) {
    throw new Error('Para actividades pendientes, la fecha de inicio debe ser en el futuro');
  }
  
  return true;
});

// Validador para actualizar estado de actividad
export const updateActivityStatusSchema = z.object({
  status: ActivityStatusEnum,
  
  startTime: z.string()
    .datetime('La fecha de inicio debe tener formato ISO válido')
    .optional()
    .transform((str: string | undefined) => str ? new Date(str) : undefined),
  
  endTime: z.string()
    .datetime('La fecha de fin debe tener formato ISO válido')
    .optional()
    .transform((str: string | undefined) => str ? new Date(str) : undefined),
}).refine((data: any) => {
  // Si el estado es completed, endTime es requerido
  if (data.status === 'completed' && !data.endTime) {
    throw new Error('Para actividades completadas, la fecha de fin es requerida');
  }
  
  // Si el estado es in_progress, startTime es requerido
  if (data.status === 'in_progress' && !data.startTime) {
    throw new Error('Para actividades en progreso, la fecha de inicio es requerida');
  }
  
  // Si el estado es completed, startTime es requerido
  if (data.status === 'completed' && !data.startTime) {
    throw new Error('Para actividades completadas, la fecha de inicio es requerida');
  }
  
  // Si se proporcionan ambas fechas, startTime debe ser anterior a endTime
  if (data.startTime && data.endTime && data.startTime >= data.endTime) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
  }
  
  return true;
});

// Validador para reasignar actividad
export const reassignActivitySchema = z.object({
  assignedTo: z.string()
    .uuid('El ID del usuario asignado debe ser un UUID válido')
    .min(1, 'El ID del usuario asignado es requerido'),
});

// Tipos TypeScript derivados de los esquemas
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityStatusInput = z.infer<typeof updateActivityStatusSchema>;
export type ReassignActivityInput = z.infer<typeof reassignActivitySchema>;
