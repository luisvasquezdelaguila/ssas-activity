// src/application/use-cases/activity.use-cases.ts

import { IActivityRepository } from '../domain/activity.repository';
import { IUserRepository } from '../domain/user.repository';
import { Activity, CreateActivityData, UpdateActivityStatusData, ReassignActivityData } from '../domain/activity.entity';

export class ActivityUseCases {
  constructor(
    private activityRepository: IActivityRepository,
    private userRepository: IUserRepository
  ) {}

  async createActivity(activityData: CreateActivityData, createdBy: string, companyId: string): Promise<Activity> {
    // Validaciones de negocio
    if (!activityData.title?.trim()) {
      throw new Error('El título de la actividad es requerido');
    }

    // Si no se proporciona assignedTo, se asigna al creador
    const assignedTo = activityData.assignedTo || createdBy;

    // Validar que el usuario asignado existe y pertenece a la misma compañía
    const assignedUser = await this.userRepository.findByIdAndCompanyId(assignedTo, companyId);
    if (!assignedUser) {
      throw new Error('El usuario asignado no existe o no pertenece a la misma compañía');
    }

    // Validar fechas si se proporcionan
    if (activityData.startTime && activityData.endTime) {
      if (activityData.startTime >= activityData.endTime) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    // Crear la actividad con el assignedTo correcto
    const finalActivityData: CreateActivityData = {
      ...activityData,
      assignedTo
    };

    return await this.activityRepository.create(finalActivityData, createdBy, companyId);
  }

  async getActivityById(id: string): Promise<Activity | null> {
    if (!id?.trim()) {
      throw new Error('ID de actividad requerido');
    }

    return await this.activityRepository.findById(id);
  }

  async getPendingActivitiesByUser(userId: string): Promise<Activity[]> {
    if (!userId?.trim()) {
      throw new Error('ID de usuario requerido');
    }

    return await this.activityRepository.findPendingByUser(userId);
  }

  async getActivitiesByUser(userId: string): Promise<Activity[]> {
    if (!userId?.trim()) {
      throw new Error('ID de usuario requerido');
    }

    return await this.activityRepository.findByUser(userId);
  }

  async updateActivityStatus(
    id: string, 
    statusData: UpdateActivityStatusData, 
    updatedBy: string
  ): Promise<Activity | null> {
    if (!id?.trim()) {
      throw new Error('ID de actividad requerido');
    }

    if (!updatedBy?.trim()) {
      throw new Error('Usuario que actualiza es requerido');
    }

    // Validar transiciones de estado
    const activity = await this.activityRepository.findById(id);
    if (!activity) {
      throw new Error('Actividad no encontrada');
    }

    // Validar transiciones permitidas
    const validTransitions: Record<string, string[]> = {
      'pending': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled', 'pending'],
      'completed': ['pending'], // Solo se puede reabrir
      'cancelled': ['pending'] // Solo se puede reactivar
    };

    if (!validTransitions[activity.status]?.includes(statusData.status)) {
      throw new Error(`No se puede cambiar de ${activity.status} a ${statusData.status}`);
    }

    // Validar fechas si se proporcionan
    if (statusData.startTime && statusData.endTime) {
      if (statusData.startTime >= statusData.endTime) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    return await this.activityRepository.updateStatus(id, statusData, updatedBy);
  }

  async reassignActivity(
    id: string, 
    reassignData: ReassignActivityData, 
    updatedBy: string,
    companyId: string
  ): Promise<Activity | null> {
    if (!id?.trim()) {
      throw new Error('ID de actividad requerido');
    }

    if (!reassignData.assignedTo?.trim()) {
      throw new Error('Usuario asignado requerido');
    }

    if (!updatedBy?.trim()) {
      throw new Error('Usuario que reasigna es requerido');
    }

    const activity = await this.activityRepository.findById(id);
    if (!activity) {
      throw new Error('Actividad no encontrada');
    }

    // No permitir reasignar actividades completadas
    if (activity.status === 'completed') {
      throw new Error('No se puede reasignar una actividad completada');
    }

    // Validar que el usuario asignado existe y pertenece a la misma compañía
    const assignedUser = await this.userRepository.findByIdAndCompanyId(reassignData.assignedTo, companyId);
    if (!assignedUser) {
      throw new Error('El usuario asignado no existe o no pertenece a la misma compañía');
    }

    return await this.activityRepository.reassign(id, reassignData, updatedBy);
  }

  async getActivitiesByCompany(companyId: string): Promise<Activity[]> {
    if (!companyId?.trim()) {
      throw new Error('ID de compañía requerido');
    }

    return await this.activityRepository.findByCompany(companyId);
  }
}
