'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    // Si ya está autenticado, redirigir al dashboard apropiado
    if (currentUser) {
      if (currentUser.role === 'super_admin') {
        router.push('/super-admin');
      } else if (currentUser.role === 'company_admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Plataforma SaaS
          </CardTitle>
          <CardDescription className="text-lg">
            Gestión de Actividades Empresariales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Sistema multi-tenant para la gestión eficiente de actividades y recursos empresariales.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
              size="lg"
            >
              Iniciar Sesión
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Características:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Gestión multi-empresa</li>
              <li>• Roles y permisos avanzados</li>
              <li>• Vista de calendario intuitiva</li>
              <li>• Reportes y análisis</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
