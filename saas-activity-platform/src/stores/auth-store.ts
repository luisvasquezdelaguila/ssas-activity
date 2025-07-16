import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Company, AuthSession, LoginData } from '@/types';
import bcrypt from 'bcryptjs';

interface AuthState {
  currentUser: User | null;
  currentCompany: Company | null;
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentCompany: (company: Company | null) => void;
  switchCompany: (companyId: string) => void;
  clearError: () => void;
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
          // Simular autenticación (en desarrollo con localStorage)
          const users = JSON.parse(localStorage.getItem('saas-platform-users') || '[]');
          const user = users.find((u: User) => u.email === data.email && u.isActive);
          
          if (!user) {
            throw new Error('Credenciales inválidas');
          }

          // Validar contraseña hasheada
          const isPasswordValid = await bcrypt.compare(data.password, user.password);
          if (!isPasswordValid) {
            throw new Error('Credenciales inválidas');
          }

          // Crear sesión
          const session: AuthSession = {
            userId: user.id,
            companyId: user.companyId,
            token: `token-${user.id}-${Date.now()}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
          };

          // Obtener empresa si el usuario tiene una
          let company = null;
          if (user.companyId) {
            const companies = JSON.parse(localStorage.getItem('saas-platform-companies') || '[]');
            company = companies.find((c: Company) => c.id === user.companyId && c.isActive);
          }

          set({
            currentUser: user,
            currentCompany: company,
            session,
            isLoading: false,
            error: null,
          });

          console.log('Login successful:', user); // Debug
        } catch (error) {
          console.error('Login error:', error); // Debug
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error de autenticación',
          });
          throw error;
        }
      },

      logout: () => {
        set({
          currentUser: null,
          currentCompany: null,
          session: null,
          error: null,
        });
      },

      setCurrentUser: (user: User | null) => {
        set({ currentUser: user });
      },

      setCurrentCompany: (company: Company | null) => {
        set({ currentCompany: company });
      },

      switchCompany: (companyId: string) => {
        const companies = JSON.parse(localStorage.getItem('saas-platform-companies') || '[]');
        const company = companies.find((c: Company) => c.id === companyId && c.isActive);
        
        if (company) {
          set({ currentCompany: company });
          // Actualizar sesión
          const currentSession = get().session;
          if (currentSession) {
            set({
              session: {
                ...currentSession,
                companyId: company.id,
              },
            });
          }
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