// src/services/activity.service.ts

import { apiClient } from '@/lib/api-client';
import { Activity, CreateActivityData, UpdateActivityData } from '@/types';

export interface ActivitiesResponse {
  activities: Activity[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ActivityResponse {
  activity: Activity;
}

export interface UpdateActivityStatusData {
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startTime?: string;
  endTime?: string;
}

export interface ReassignActivityData {
  assignedTo: string;
  reason?: string;
}

export class ActivityService {
  // Obtener todas las actividades
  static async getActivities(): Promise<Activity[]> {
    const response = await apiClient.get<ActivitiesResponse>('/activities');
    return response.activities;
  }

  // Obtener actividades pendientes del usuario actual
  static async getPendingActivities(): Promise<Activity[]> {
    const response = await apiClient.get<ActivitiesResponse>('/activities/pending');
    return response.activities;
  }

  // Obtener actividades del usuario actual
  static async getMyActivities(): Promise<Activity[]> {
    const response = await apiClient.get<ActivitiesResponse>('/activities/my-activities');
    return response.activities;
  }

  // Obtener actividad por ID
  static async getActivityById(id: string): Promise<Activity> {
    const response = await apiClient.get<ActivityResponse>(`/activities/${id}`);
    return response.activity;
  }

  // Crear nueva actividad
  static async createActivity(activityData: CreateActivityData): Promise<Activity> {
    const response = await apiClient.post<ActivityResponse>('/activities', activityData);
    return response.activity;
  }

  // Actualizar actividad
  static async updateActivity(id: string, activityData: UpdateActivityData): Promise<Activity> {
    const response = await apiClient.put<ActivityResponse>(`/activities/${id}`, activityData);
    return response.activity;
  }

  // Actualizar estado de actividad
  static async updateActivityStatus(id: string, statusData: UpdateActivityStatusData): Promise<Activity> {
    const response = await apiClient.put<ActivityResponse>(`/activities/${id}/status`, statusData);
    return response.activity;
  }

  // Reasignar actividad
  static async reassignActivity(id: string, reassignData: ReassignActivityData): Promise<Activity> {
    const response = await apiClient.put<ActivityResponse>(`/activities/${id}/reassign`, reassignData);
    return response.activity;
  }

  // Eliminar actividad
  static async deleteActivity(id: string): Promise<void> {
    await apiClient.delete(`/activities/${id}`);
  }

  // Obtener actividades por empresa
  static async getActivitiesByCompany(companyId: string): Promise<Activity[]> {
    const response = await apiClient.get<ActivitiesResponse>(`/activities/company/${companyId}`);
    return response.activities;
  }

  // Obtener actividades por usuario
  static async getActivitiesByUser(userId: string): Promise<Activity[]> {
    const response = await apiClient.get<ActivitiesResponse>(`/activities/user/${userId}`);
    return response.activities;
  }

  // Buscar actividades
  static async searchActivities(query: string): Promise<Activity[]> {
    const response = await apiClient.get<ActivitiesResponse>(`/activities/search?q=${encodeURIComponent(query)}`);
    return response.activities;
  }

  // Obtener actividades por rango de fechas
  static async getActivitiesByDateRange(startDate: string, endDate: string): Promise<Activity[]> {
    const response = await apiClient.get<ActivitiesResponse>(
      `/activities/date-range?start=${startDate}&end=${endDate}`
    );
    return response.activities;
  }
}

export default ActivityService;
