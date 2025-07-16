'use client';

import { useEffect } from 'react';
import { initializeDefaultData } from '@/lib/init-data';

export function DataInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      initializeDefaultData().catch(console.error);
    }
  }, []);

  return <>{children}</>;
}