import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Company } from '@/types';
import { AuthService } from '@/services/auth.service';

export interface AuthSession {
  token: string;
  userId: string;
  companyId?: string;
  expiresAt?: Date;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface PhoneLoginData {
  phone: string;
}

interface AuthState {
  currentUser: User | null;
  currentCompany: Company | null;
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (data: LoginData) => Promise<void>;
  phoneLogin: (data: PhoneLoginData) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  setCurrentCompany: (company: Company | null) => void;
  switchCompany: (companyId: string) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentUser: null,
      currentCompany: null,
      session: null,
      isLoading: false,
      error: null,

      // Acciones
      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.login(data);
          
          const session: AuthSession = {
            token: response.token,
            userId: response.user.id,
            companyId: response.user.companyId,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
          };

          set({
            currentUser: response.user,
            session,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error de autenticación',
          });
          throw error;
        }
      },

      phoneLogin: async (data: PhoneLoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.phoneLogin(data);
          
          const session: AuthSession = {
            token: response.token,
            userId: response.user.id,
            companyId: response.user.companyId,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
          };

          set({
            currentUser: response.user,
            session,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error de autenticación por teléfono',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await AuthService.logout();
        } catch (error) {
          // Esto raramente debería fallar ya que solo limpia local
          console.warn('Error durante logout:', error);
        } finally {
          // Limpiar estado de la aplicación
          set({
            currentUser: null,
            currentCompany: null,
            session: null,
            error: null,
            isLoading: false,
          });
        }
      },

      setCurrentUser: (user: User | null) => {
        set({ currentUser: user });
      },

      setCurrentCompany: (company: Company | null) => {
        set({ currentCompany: company });
      },

      switchCompany: (companyId: string) => {
        const currentSession = get().session;
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            companyId,
          };
          set({ session: updatedSession });
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          if (AuthService.isAuthenticated()) {
            const user = await AuthService.getCurrentUser();
            set({
              currentUser: user,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          // Token inválido o expirado - limpiar estado
          try {
            await AuthService.logout();
          } catch (logoutError) {
            console.warn('Error durante logout automático:', logoutError);
          }
          set({
            currentUser: null,
            session: null,
            isLoading: false,
          });
        }
      },

      checkAuthStatus: async (): Promise<boolean> => {
        try {
          const isValid = await AuthService.verifyToken();
          if (!isValid) {
            await get().logout();
            return false;
          }
          return true;
        } catch {
          await get().logout();
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentCompany: state.currentCompany,
        session: state.session,
      }),
    }
  )
);