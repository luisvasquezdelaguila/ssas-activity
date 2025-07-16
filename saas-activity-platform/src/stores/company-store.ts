import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company, CreateCompanyData, UpdateCompanyData, User } from '@/types';
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
          const newCompany: Company = {
            id: uuidv4(),
            name: data.name,
            domain: data.domain,
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
          const companies = [...get().companies, newCompany];
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
          const companies = get().companies.map(company => 
            company.id === id 
              ? {
                  ...company,
                  name: data.name ?? company.name,
                  domain: data.domain ?? company.domain,
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
          const companies = get().companies.map(company => 
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
        return get().companies.find(company => company.id === id);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'company-storage',
      partialize: (state) => ({
        companies: state.companies,
        selectedCompany: state.selectedCompany,
      }),
    }
  )
);