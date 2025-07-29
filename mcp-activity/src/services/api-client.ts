// src/services/api-client.ts

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, AuthResponse, Activity, CreateActivityData, UpdateActivityStatusData, ReassignActivityData } from '../types/api.types';

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Autentica un usuario por número de teléfono
   */
  async authenticateByPhone(phone: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post('/auth/phone-login', {
        phone
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Authentication failed');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(`Authentication error: ${error.message}`);
    }
  }

  /**
   * Obtiene actividades pendientes del usuario autenticado
   */
  async getUserPendingActivities(token: string): Promise<Activity[]> {
    try {
      const response: AxiosResponse<ApiResponse<{ activities: Activity[] }>> = await this.client.get('/activities/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch activities');
      }

      return response.data.data.activities;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(`Error fetching activities: ${error.message}`);
    }
  }

  /**
   * Obtiene todas las actividades del usuario autenticado
   */
  async getUserActivities(token: string): Promise<Activity[]> {
    try {
      const response: AxiosResponse<ApiResponse<{ activities: Activity[] }>> = await this.client.get('/activities/my-activities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch activities');
      }

      return response.data.data.activities;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(`Error fetching activities: ${error.message}`);
    }
  }

  /**
   * Obtiene una actividad por ID
   */
  async getActivityById(activityId: string, token: string): Promise<Activity> {
    try {
      const response: AxiosResponse<ApiResponse<{ activity: Activity }>> = await this.client.get(`/activities/${activityId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Activity not found');
      }

      return response.data.data.activity;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(`Error fetching activity: ${error.message}`);
    }
  }

  /**
   * Crea una nueva actividad
   */
  async createActivity(activityData: CreateActivityData, token: string): Promise<Activity> {
    try {
      const response: AxiosResponse<ApiResponse<{ activity: Activity }>> = await this.client.post('/activities', activityData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to create activity');
      }

      return response.data.data.activity;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(`Error creating activity: ${error.message}`);
    }
  }

  /**
   * Actualiza el estado de una actividad
   */
  async updateActivityStatus(activityId: string, statusData: UpdateActivityStatusData, token: string): Promise<Activity> {
    try {
      const response: AxiosResponse<ApiResponse<{ activity: Activity }>> = await this.client.patch(`/activities/${activityId}/status`, statusData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to update activity status');
      }

      return response.data.data.activity;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(`Error updating activity status: ${error.message}`);
    }
  }

  /**
   * Reasigna una actividad a otro usuario
   */
  async reassignActivity(activityId: string, reassignData: ReassignActivityData, token: string): Promise<Activity> {
    try {
      const response: AxiosResponse<ApiResponse<{ activity: Activity }>> = await this.client.patch(`/activities/${activityId}/reassign`, reassignData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to reassign activity');
      }

      return response.data.data.activity;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(`Error reassigning activity: ${error.message}`);
    }
  }
}
