'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import { 
  Calendar, 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  LogOut,
  Home,
  Plus
} from 'lucide-react';

export function Navigation() {
  const router = useRouter();
  const { currentUser, currentCompany, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getNavItems = () => {
    if (!currentUser) return [];

    if (currentUser.role === 'super_admin') {
      return [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: Building2, label: 'Empresas', href: '/super-admin' },
        { icon: Calendar, label: 'Calendario', href: '/calendar' },
        { icon: BarChart3, label: 'Reportes', href: '/reports' },
        { icon: Settings, label: 'Configuración', href: '/super-admin/settings' },
      ];
    }

    if (currentUser.role === 'company_admin') {
      return [
        { icon: Home, label: 'Dashboard', href: '/admin' },
        { icon: Calendar, label: 'Calendario', href: '/calendar' },
        { icon: Users, label: 'Usuarios', href: '/admin/users' },
        { icon: Building2, label: 'Áreas', href: '/admin/areas' },
        { icon: BarChart3, label: 'Reportes', href: '/reports' },
        { icon: Settings, label: 'Configuración', href: '/admin/settings' },
      ];
    }

    if (currentUser.role === 'operator') {
      return [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: Calendar, label: 'Calendario', href: '/calendar' },
        { icon: Users, label: 'Equipo', href: '/operator/team' },
        { icon: BarChart3, label: 'Reportes', href: '/reports' },
      ];
    }

    // Usuario regular
    return [
      { icon: Home, label: 'Dashboard', href: '/dashboard' },
      { icon: Calendar, label: 'Calendario', href: '/calendar' },
      { icon: Plus, label: 'Nueva Actividad', href: '/activities/new' },
      { icon: BarChart3, label: 'Reportes', href: '/reports' },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col justify-between py-6 px-4 shadow-lg">
      <div>
        <div className="flex flex-col items-start mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Plataforma SaaS</h1>
          {currentCompany && (
            <Badge variant="outline" className="text-xs">
              {currentCompany.name}
            </Badge>
          )}
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                onClick={() => router.push(item.href)}
                className="flex items-center gap-2 justify-start w-full"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-col gap-4 mt-8">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {currentUser?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {currentUser?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-gray-500 hover:text-gray-700 w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}