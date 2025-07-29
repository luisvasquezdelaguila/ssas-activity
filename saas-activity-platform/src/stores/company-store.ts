import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company, CreateCompanyData, UpdateCompanyData, User } from '@/types';
import type { Plan } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  isLoading: boolean;
  error: string | null;
}

interface CompanyActions {
  loadCompanies: () => void;
  createCompany: (data: CreateCompanyData) => Promise<Company>;
  updateCompany: (id: string, data: UpdateCompanyData) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  setSelectedCompany: (company: Company | null) => void;
  getCompanyById: (id: string) => Company | undefined;
  clearError: () => void;
}

type CompanyStore = CompanyState & CompanyActions;

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      companies: [],
      selectedCompany: null,
      isLoading: false,
      error: null,

      // Acciones
      loadCompanies: () => {
        try {
          const companies = JSON.parse(localStorage.getItem('saas-platform-companies') || '[]');
          set({ companies });
        } catch (error) {
          set({ error: 'Error al cargar empresas' });
        }
      },

      createCompany: async (data: CreateCompanyData) => {
        set({ isLoading: true, error: null });
        try {
          // Obtener el plan seleccionado
          let planObj: Plan | undefined = undefined;
          const plansRaw = localStorage.getItem('saas-platform-plans');
          if (plansRaw) {
            const plans: Plan[] = JSON.parse(plansRaw);
            planObj = plans.find((p: Plan) => p.id === data.planId);
          }
          const newCompany: Company = {
            id: uuidv4(),
            name: data.name,
            domain: data.domain,
            planId: data.planId,
            plan: planObj,
            settings: {
              timezone: data.settings?.timezone || 'America/Mexico_City',
              workingHours: {
                start: data.settings?.workingHours?.start || '09:00',
                end: data.settings?.workingHours?.end || '18:00',
              },
              allowUserSelfRegistration: data.settings?.allowUserSelfRegistration || false,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
          };
          // Hashear la contraseña del administrador
          const hashedPassword = await bcrypt.hash(data.adminPassword, 10);
          // Crear administrador de la empresa
          const adminUser: User = {
            id: uuidv4(),
            email: data.adminEmail,
            name: data.adminName,
            password: hashedPassword,
            role: 'company_admin',
            companyId: newCompany.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
          };
          // Guardar empresa
          const companies = [...(get() as CompanyStore).companies, newCompany];
          localStorage.setItem('saas-platform-companies', JSON.stringify(companies));
          // Guardar usuario administrador
          const users = JSON.parse(localStorage.getItem('saas-platform-users') || '[]');
          users.push(adminUser);
          localStorage.setItem('saas-platform-users', JSON.stringify(users));
          set({ 
            companies,
            isLoading: false,
            error: null,
          });
          return newCompany;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al crear empresa',
          });
          throw error;
        }
      },

      updateCompany: async (id: string, data: UpdateCompanyData) => {
        set({ isLoading: true, error: null });
        try {
          // Si se actualiza el planId, buscar el plan correspondiente
          let planObj: Plan | undefined = data.plan;
          if (!planObj && data.planId) {
            const plansRaw = localStorage.getItem('saas-platform-plans');
            if (plansRaw) {
              const plans: Plan[] = JSON.parse(plansRaw);
              planObj = plans.find((p: Plan) => p.id === data.planId);
            }
          }
          const companies = (get() as CompanyStore).companies.map((company: Company) => 
            company.id === id 
              ? {
                  ...company,
                  name: data.name ?? company.name,
                  domain: data.domain ?? company.domain,
                  planId: data.planId ?? company.planId,
                  plan: planObj ?? company.plan,
                  settings: data.settings ? { ...company.settings, ...data.settings } : company.settings,
                  isActive: data.isActive ?? company.isActive,
                  updatedAt: new Date(),
                }
              : company
          );
          localStorage.setItem('saas-platform-companies', JSON.stringify(companies));
          set({ 
            companies,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al actualizar empresa',
          });
          throw error;
        }
      },

      deleteCompany: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          // Marcar empresa como inactiva en lugar de eliminarla
          const companies = (get() as CompanyStore).companies.map((company: Company) => 
            company.id === id 
              ? { ...company, isActive: false, updatedAt: new Date() }
              : company
          );
          // También desactivar usuarios de la empresa
          const users = JSON.parse(localStorage.getItem('saas-platform-users') || '[]');
          const updatedUsers = users.map((user: User) => 
            user.companyId === id 
              ? { ...user, isActive: false, updatedAt: new Date() }
              : user
          );
          localStorage.setItem('saas-platform-companies', JSON.stringify(companies));
          localStorage.setItem('saas-platform-users', JSON.stringify(updatedUsers));
          set({ 
            companies,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al eliminar empresa',
          });
          throw error;
        }
      },

      setSelectedCompany: (company: Company | null) => {
        set({ selectedCompany: company });
      },

      getCompanyById: (id: string) => {
        return (get() as CompanyStore).companies.find((company: Company) => company.id === id);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'company-storage',
      partialize: (state: CompanyStore) => ({
        companies: state.companies,
        selectedCompany: state.selectedCompany,
      }),
    }
  )
);