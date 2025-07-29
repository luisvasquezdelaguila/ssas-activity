'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
  Plus,
  Menu
} from 'lucide-react';

export function Navigation() {

  const router = useRouter();
  const { currentUser, currentCompany, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error durante logout:', error);
      // Aunque falle, redirigir al login por seguridad
      router.push('/login');
    }
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
    <>
      {/* Botón menú hamburguesa solo en móviles */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      {/* Sidebar en desktop */}
      <aside className="hidden md:flex w-64 min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-purple-700 flex-col justify-between py-7 px-5 shadow-2xl">
        <div>
        <div className="flex flex-col items-start mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white text-blue-700 rounded-full h-9 w-9 flex items-center justify-center text-xl font-bold shadow">A</div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Activitix</h1>
          </div>
          {currentCompany && (
            <Badge variant="outline" className="text-xs bg-white text-blue-700 border-blue-300">
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
                className="flex items-center gap-2 justify-start w-full text-white hover:bg-blue-800/80 hover:text-yellow-300 transition-colors"
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium tracking-tight">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-col gap-4 mt-8">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-8 w-8 bg-white">
            <AvatarFallback className="text-blue-700 text-xs font-bold">
              {currentUser?.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-white">
              {currentUser?.name}
            </p>
            <p className="text-xs text-blue-200 capitalize">
              {currentUser?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-blue-200 hover:text-yellow-300 w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
      {/* Sidebar tipo drawer en móviles */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex transition-opacity duration-300 opacity-100">
          <aside className="w-64 min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-purple-700 flex flex-col justify-between py-7 px-5 shadow-2xl transform transition-transform duration-300 translate-x-0 md:translate-x-0 animate-slide-in-sidebar">
            <div>
              <div className="flex flex-col items-start mb-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-white text-blue-700 rounded-full h-9 w-9 flex items-center justify-center text-xl font-bold shadow">A</div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">Activitix</h1>
                </div>
                {currentCompany && (
                  <Badge variant="outline" className="text-xs bg-white text-blue-700 border-blue-300">
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
                      onClick={() => { setOpen(false); router.push(item.href); }}
                      className="flex items-center gap-2 justify-start w-full text-white hover:bg-blue-800/80 hover:text-yellow-300 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium tracking-tight">{item.label}</span>
                    </Button>
                  );
                })}
              </nav>
            </div>
            <div className="flex flex-col gap-4 mt-8">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-8 w-8 bg-white">
                  <AvatarFallback className="text-blue-700 text-xs font-bold">
                    {currentUser?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-blue-200 capitalize">
                    {currentUser?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setOpen(false); handleLogout(); }}
                className="text-blue-200 hover:text-yellow-300 w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
            <Button variant="outline" size="icon" className="absolute top-4 right-4" onClick={() => setOpen(false)}>
              X
            </Button>
          </aside>
        </div>
      )}
    </>
  );
}