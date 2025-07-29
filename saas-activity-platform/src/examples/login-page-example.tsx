// Ejemplo de uso del nuevo sistema integrado con API

// src/app/login/page.tsx (ejemplo)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { login, phoneLogin, isLoading, error } = useAuthStore();
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      router.push('/dashboard');
    } catch (error) {
      // Error ya está manejado en el store
      console.error('Login failed:', error);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await phoneLogin({
        phone: formData.phone,
      });
      router.push('/dashboard');
    } catch (error) {
      // Error ya está manejado en el store
      console.error('Phone login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar Sesión - SSAS Activity</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={loginType === 'email' ? 'default' : 'outline'}
              onClick={() => setLoginType('email')}
            >
              Email
            </Button>
            <Button
              variant={loginType === 'phone' ? 'default' : 'outline'}
              onClick={() => setLoginType('phone')}
            >
              Teléfono
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {loginType === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <Input
                type="tel"
                placeholder="Teléfono (ej: +51987654321)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión con Teléfono'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
