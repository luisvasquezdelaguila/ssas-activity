'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import { useCompanyStore } from '@/stores/company-store';
import { useActivityStore } from '@/stores/activity-store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { currentUser, currentCompany } = useAuthStore();
  const { loadUsers } = useUserStore();
  const { loadCompanies } = useCompanyStore();
  const { loadActivities } = useActivityStore();

  useEffect(() => {
    // Verificar autenticación
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Cargar datos iniciales
    loadUsers();
    loadCompanies();
    loadActivities();
  }, [currentUser, router, loadUsers, loadCompanies, loadActivities]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}