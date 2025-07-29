import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, CreateUserData, UpdateUserData } from '@/types';
import { UserService } from '@/services/user.service';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  loadUsers: () => Promise<void>;
  createUser: (data: CreateUserData) => Promise<User>;
  updateUser: (id: string, data: UpdateUserData) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getUsersByCompany: (companyId: string) => User[];
  getUserById: (id: string) => User | undefined;
  clearError: () => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      users: [],
      isLoading: false,
      error: null,

      // Acciones
      loadUsers: async () => {
        set({ isLoading: true, error: null });
        try {
          const users = await UserService.getUsers();
          set({ users, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error al cargar usuarios',
            isLoading: false 
          });
        }
      },

      createUser: async (data: CreateUserData) => {
        set({ isLoading: true, error: null });
        try {
          const newUser = await UserService.createUser(data);
          
          // Actualizar lista local
          const users = [...get().users, newUser];
          set({ 
            users,
            isLoading: false,
            error: null,
          });

          return newUser;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al crear usuario',
          });
          throw error;
        }
      },

      updateUser: async (id: string, data: UpdateUserData) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedUser = await UserService.updateUser(id, data);
          
          // Actualizar lista local
          const users = get().users.map(user => 
            user.id === id ? updatedUser : user
          );

          set({ 
            users,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al actualizar usuario',
          });
          throw error;
        }
      },

      deleteUser: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await UserService.deleteUser(id);
          
          // Actualizar lista local (remover o marcar como inactivo)
          const users = get().users.map(user => 
            user.id === id 
              ? { ...user, isActive: false }
              : user
          );

          set({ 
            users,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al eliminar usuario',
          });
          throw error;
        }
      },

      getUsersByCompany: (companyId: string) => {
        return get().users.filter(user => user.companyId === companyId && user.isActive);
      },

      getUserById: (id: string) => {
        return get().users.find(user => user.id === id);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        users: state.users,
      }),
    }
  )
);