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

    const baseItems = [
      { icon: Home, label: 'Dashboard', href: '/dashboard' },
      { icon: Calendar, label: 'Calendario', href: '/calendar' },
    ];

    if (currentUser.role === 'super_admin') {
      return [
        { icon: Building2, label: 'Empresas', href: '/super-admin' },
        { icon: BarChart3, label: 'Reportes', href: '/super-admin/reports' },
        { icon: Settings, label: 'Configuración', href: '/super-admin/settings' },
      ];
    }

    if (currentUser.role === 'company_admin') {
      return [
        ...baseItems,
        { icon: Users, label: 'Usuarios', href: '/admin/users' },
        { icon: BarChart3, label: 'Reportes', href: '/admin/reports' },
        { icon: Settings, label: 'Configuración', href: '/admin/settings' },
      ];
    }

    if (currentUser.role === 'operator') {
      return [
        ...baseItems,
        { icon: Users, label: 'Equipo', href: '/operator/team' },
      ];
    }

    return [
      ...baseItems,
      { icon: Plus, label: 'Nueva Actividad', href: '/activities/new' },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">
            Plataforma SaaS
          </h1>
          
          {currentCompany && (
            <Badge variant="outline" className="text-xs">
              {currentCompany.name}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(item.href)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
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
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}