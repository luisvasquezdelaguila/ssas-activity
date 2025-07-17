'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';
import { useActivityStore } from '@/stores/activity-store';
import { useUserStore } from '@/stores/user-store';
import { Area } from '@/types';
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle, 
  Users, 
  Building2,
  Activity,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { currentUser, currentCompany } = useAuthStore();
  const { activities, getActivitiesByCompany } = useActivityStore();
  const { getUsersByCompany } = useUserStore();
  const [areas, setAreas] = useState<Area[]>([]);
  const [companyActivities, setCompanyActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!currentCompany) return;
    
    // Cargar áreas
    const areasRaw = localStorage.getItem("saas-platform-areas");
    let allAreas: Area[] = areasRaw ? JSON.parse(areasRaw) : [];
    const companyAreas = allAreas.filter((a) => a.companyId === currentCompany.id && a.isActive !== false);
    setAreas(companyAreas);

    // Cargar actividades de la empresa
    const activities = getActivitiesByCompany(currentCompany.id);
    setCompanyActivities(activities);
  }, [currentCompany, activities, getActivitiesByCompany]);

  const companyUsers = currentCompany ? getUsersByCompany(currentCompany.id) : [];
  
  const todayActivities = companyActivities.filter(activity => 
    isToday(new Date(activity.startDate))
  );

  const upcomingActivities = companyActivities.filter(activity => 
    new Date(activity.startDate) > new Date() && !isToday(new Date(activity.startDate))
  ).slice(0, 5);

  const getActivityStatus = (activity: any) => {
    const now = new Date();
    const start = new Date(activity.startDate);
    const end = new Date(activity.endDate);

    if (now > end) return 'completed';
    if (now >= start && now <= end) return 'in-progress';
    return 'upcoming';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completada</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">En progreso</Badge>;
      default:
        return <Badge variant="outline">Próxima</Badge>;
    }
  };

  const getAreaActivities = (areaId: string) => {
    return companyActivities.filter(activity => activity.areaId === areaId);
  };

  const getAreaUsers = (areaId: string) => {
    return companyUsers.filter(user => user.areaId === areaId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Administración
            </h1>
            <p className="text-gray-600">
              Gestión completa de {currentCompany?.name}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => router.push('/activities/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Actividad
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/areas')}>
              <Building2 className="h-4 w-4 mr-2" />
              Gestionar Áreas
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Áreas Activas
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{areas.length}</div>
              <p className="text-xs text-muted-foreground">
                Áreas de la empresa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuarios Totales
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                En toda la empresa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Actividades Hoy
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayActivities.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayActivities.length === 1 ? 'actividad programada' : 'actividades programadas'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Actividades
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyActivities.length}</div>
              <p className="text-xs text-muted-foreground">
                En toda la empresa
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Áreas de la Empresa */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Áreas de la Empresa</span>
                </CardTitle>
                <CardDescription>
                  Gestiona las diferentes áreas y sus actividades
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => router.push('/admin/areas')}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Área
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {areas.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No hay áreas creadas aún</p>
                <Button onClick={() => router.push('/admin/areas')}>
                  Crear primera área
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {areas.map((area) => {
                  const areaActivities = getAreaActivities(area.id);
                  const areaUsers = getAreaUsers(area.id);
                  
                  return (
                    <Card key={area.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{area.name}</CardTitle>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                        {area.description && (
                          <CardDescription className="text-sm">
                            {area.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>Usuarios:</span>
                            </span>
                            <Badge variant="outline">{areaUsers.length}</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center space-x-1">
                              <Activity className="h-4 w-4" />
                              <span>Actividades:</span>
                            </span>
                            <Badge variant="outline">{areaActivities.length}</Badge>
                          </div>

                          <div className="pt-2 space-y-2">
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => router.push(`/admin/areas/${area.id}`)}
                            >
                              Ver Área
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => router.push(`/admin/areas/${area.id}/users`)}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Gestionar Usuarios
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Actividades de Hoy - Toda la Empresa</CardTitle>
            <CardDescription>
              Actividades programadas para hoy en todas las áreas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayActivities.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay actividades programadas para hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayActivities.map((activity) => {
                  const user = companyUsers.find(u => u.id === activity.userId);
                  const area = areas.find(a => a.id === activity.areaId);
                  
                  return (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{activity.title}</h3>
                        {activity.description && (
                          <p className="text-sm text-gray-600">{activity.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>
                            {format(new Date(activity.startDate), 'HH:mm', { locale: es })} - 
                            {format(new Date(activity.endDate), 'HH:mm', { locale: es })}
                          </span>
                          {user && <span>👤 {user.name}</span>}
                          {area && <span>🏢 {area.name}</span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(getActivityStatus(activity))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push('/admin/users')}
              >
                <Users className="h-6 w-6" />
                <span>Gestionar Usuarios</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push('/reports')}
              >
                <Activity className="h-6 w-6" />
                <span>Ver Reportes</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push('/calendar')}
              >
                <Calendar className="h-6 w-6" />
                <span>Ver Calendario</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}