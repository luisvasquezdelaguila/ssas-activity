'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { loginSchema, type LoginFormData } from '@/lib/validations';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showError, setShowError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Limpiar errores cuando el usuario empiece a escribir
  const watchedFields = watch();
  useEffect(() => {
    if (error || showError) {
      clearError();
      setShowError(false);
    }
  }, [watchedFields.username, watchedFields.password, clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setShowError(false);
      await login(data);
      
      // Obtener usuario actualizado del store
      const currentUser = useAuthStore.getState().currentUser;
      console.log('Usuario autenticado:', currentUser);
      
      // Redireccionar según el rol del usuario
      if (currentUser?.role === 'super_admin') {
        router.push('/super-admin');
      } else if (currentUser?.role === 'company_admin') {
        router.push('/admin/users');
      } else if (currentUser?.role === 'operator') {
        router.push('/activities');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                autoComplete="username"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {(error || showError) && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {error || 'Credenciales incorrectas. Verifica tu usuario y contraseña.'}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <Button
            variant="secondary"
            className="w-full mt-4"
            onClick={() => router.push('/')}
          >
            &larr; Volver a la página principal
          </Button>

          {/* <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800 font-medium mb-2">Usuarios de prueba:</p>
            <div className="text-xs text-blue-700 space-y-2">
              <div>
                <p><strong>Super Admin:</strong> superadmin</p>
                <p><strong>Contraseña:</strong> password123</p>
              </div>
              <div>
                <p><strong>Admin Empresa:</strong> admin</p>
                <p><strong>Operador:</strong> operador</p>
                <p><strong>Usuario:</strong> usuario</p>
                <p><strong>Contraseña:</strong> demo123</p>
              </div>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}