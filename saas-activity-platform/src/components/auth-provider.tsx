// src/components/auth-provider.tsx

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Inicializar autenticación al cargar la app
    initializeAuth().catch(console.error);
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthProvider;
