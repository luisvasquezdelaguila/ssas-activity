import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, CreateUserData, UpdateUserData, Area } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  loadUsers: () => void;
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
      loadUsers: () => {
        try {
          const users = JSON.parse(localStorage.getItem('saas-platform-users') || '[]');
          set({ users });
        } catch (error) {
          set({ error: 'Error al cargar usuarios' });
        }
      },

      createUser: async (data: CreateUserData) => {
        set({ isLoading: true, error: null });
        try {
          // Verificar que el email no exista
          const existingUser = get().users.find(user => user.email === data.email);
          if (existingUser) {
            throw new Error('Ya existe un usuario con este email');
          }

          // Hashear la contraseña
          const hashedPassword = await bcrypt.hash(data.password, 10);

          // Buscar área por defecto "Colaboradores" para la empresa
          let areaId = data['areaId'];
          if (!areaId && data.companyId) {
            const areasRaw = localStorage.getItem('saas-platform-areas');
            let areas: Area[] = [];
            if (areasRaw) {
              areas = JSON.parse(areasRaw);
            }
            let defaultArea = areas.find(a => a.companyId === data.companyId && a.name.toLowerCase() === 'colaboradores');
            if (!defaultArea) {
              // Crear área por defecto si no existe
              defaultArea = {
                id: uuidv4(),
                name: 'Colaboradores',
                companyId: data.companyId,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              areas.push(defaultArea);
              localStorage.setItem('saas-platform-areas', JSON.stringify(areas));
            }
            areaId = defaultArea.id;
          }

          const newUser: User = {
            id: uuidv4(),
            email: data.email,
            name: data.name,
            password: hashedPassword,
            role: data.role,
            companyId: data.companyId,
            areaId,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
          };

          const users = [...get().users, newUser];
          localStorage.setItem('saas-platform-users', JSON.stringify(users));

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
          const users = get().users.map(user => 
            user.id === id 
              ? {
                  ...user,
                  ...data,
                  updatedAt: new Date(),
                }
              : user
          );

          localStorage.setItem('saas-platform-users', JSON.stringify(users));
          
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
          // Marcar usuario como inactivo en lugar de eliminarlo
          const users = get().users.map(user => 
            user.id === id 
              ? { ...user, isActive: false, updatedAt: new Date() }
              : user
          );

          localStorage.setItem('saas-platform-users', JSON.stringify(users));
          
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