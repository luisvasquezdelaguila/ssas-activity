import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Activity, CreateActivityData, UpdateActivityData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}

interface ActivityActions {
  loadActivities: () => void;
  createActivity: (data: CreateActivityData, userId: string, companyId: string) => Promise<Activity>;
  updateActivity: (id: string, data: UpdateActivityData) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  getActivitiesByUser: (userId: string) => Activity[];
  getActivitiesByCompany: (companyId: string) => Activity[];
  getActivitiesByDateRange: (start: Date, end: Date, userId?: string, companyId?: string) => Activity[];
  getActivityById: (id: string) => Activity | undefined;
  clearError: () => void;
}

type ActivityStore = ActivityState & ActivityActions;

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      activities: [],
      isLoading: false,
      error: null,

      // Acciones
      loadActivities: () => {
        try {
          const activities = JSON.parse(localStorage.getItem('saas-platform-activities') || '[]')
            .map((activity: any) => ({
              ...activity,
              startDate: new Date(activity.startDate),
              endDate: new Date(activity.endDate),
              createdAt: new Date(activity.createdAt),
              updatedAt: new Date(activity.updatedAt),
            }));
          set({ activities });
        } catch (error) {
          set({ error: 'Error al cargar actividades' });
        }
      },

      createActivity: async (data: CreateActivityData, userId: string, companyId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const newActivity: Activity = {
            id: uuidv4(),
            title: data.title,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            userId,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const activities = [...get().activities, newActivity];
          
          // Serializar fechas para localStorage
          const serializedActivities = activities.map(activity => ({
            ...activity,
            startDate: activity.startDate.toISOString(),
            endDate: activity.endDate.toISOString(),
            createdAt: activity.createdAt.toISOString(),
            updatedAt: activity.updatedAt.toISOString(),
          }));
          
          localStorage.setItem('saas-platform-activities', JSON.stringify(serializedActivities));

          set({ 
            activities,
            isLoading: false,
            error: null,
          });

          return newActivity;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al crear actividad',
          });
          throw error;
        }
      },

      updateActivity: async (id: string, data: UpdateActivityData) => {
        set({ isLoading: true, error: null });
        
        try {
          const activities = get().activities.map(activity => 
            activity.id === id 
              ? {
                  ...activity,
                  ...data,
                  updatedAt: new Date(),
                }
              : activity
          );

          // Serializar fechas para localStorage
          const serializedActivities = activities.map(activity => ({
            ...activity,
            startDate: activity.startDate.toISOString(),
            endDate: activity.endDate.toISOString(),
            createdAt: activity.createdAt.toISOString(),
            updatedAt: activity.updatedAt.toISOString(),
          }));

          localStorage.setItem('saas-platform-activities', JSON.stringify(serializedActivities));
          
          set({ 
            activities,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al actualizar actividad',
          });
          throw error;
        }
      },

      deleteActivity: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const activities = get().activities.filter(activity => activity.id !== id);
          
          // Serializar fechas para localStorage
          const serializedActivities = activities.map(activity => ({
            ...activity,
            startDate: activity.startDate.toISOString(),
            endDate: activity.endDate.toISOString(),
            createdAt: activity.createdAt.toISOString(),
            updatedAt: activity.updatedAt.toISOString(),
          }));

          localStorage.setItem('saas-platform-activities', JSON.stringify(serializedActivities));
          
          set({ 
            activities,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al eliminar actividad',
          });
          throw error;
        }
      },

      getActivitiesByUser: (userId: string) => {
        return get().activities.filter(activity => activity.userId === userId);
      },

      getActivitiesByCompany: (companyId: string) => {
        return get().activities.filter(activity => activity.companyId === companyId);
      },

      getActivitiesByDateRange: (start: Date, end: Date, userId?: string, companyId?: string) => {
        return get().activities.filter(activity => {
          const activityStart = new Date(activity.startDate);
          const activityEnd = new Date(activity.endDate);
          
          const inDateRange = activityStart >= start && activityEnd <= end;
          const matchesUser = !userId || activity.userId === userId;
          const matchesCompany = !companyId || activity.companyId === companyId;
          
          return inDateRange && matchesUser && matchesCompany;
        });
      },

      getActivityById: (id: string) => {
        return get().activities.find(activity => activity.id === id);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'activity-storage',
      partialize: (state) => ({
        activities: state.activities,
      }),
    }
  )
);