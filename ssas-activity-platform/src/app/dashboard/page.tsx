'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';
import { useActivityStore } from '@/stores/activity-store';
import { Calendar, Plus, Clock, CheckCircle } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, currentCompany } = useAuthStore();
  const { activities, getActivitiesByUser } = useActivityStore();
  const [userActivities, setUserActivities] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser) {
      const activities = getActivitiesByUser(currentUser.id);
      setUserActivities(activities);
    }
  }, [currentUser, activities, getActivitiesByUser]);

  const todayActivities = userActivities.filter(activity => 
    isToday(new Date(activity.startDate))
  );

  const upcomingActivities = userActivities.filter(activity => 
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Hola, {currentUser?.name}!
            </h1>
            <p className="text-gray-600">
              Aquí tienes un resumen de tus actividades
            </p>
          </div>
          <Button onClick={() => router.push('/activities/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Actividad
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userActivities.length}</div>
              <p className="text-xs text-muted-foreground">
                En total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próximas
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingActivities.length}</div>
              <p className="text-xs text-muted-foreground">
                Por venir
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Actividades de Hoy</CardTitle>
            <CardDescription>
              Tus actividades programadas para hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayActivities.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tienes actividades programadas para hoy</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => router.push('/activities/new')}
                >
                  Crear nueva actividad
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{activity.title}</h3>
                      {activity.description && (
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.startDate), 'HH:mm', { locale: es })} - {format(new Date(activity.endDate), 'HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(getActivityStatus(activity))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Activities */}
        {upcomingActivities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Próximas Actividades</CardTitle>
              <CardDescription>
                Tus próximas actividades programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{activity.title}</h3>
                      {activity.description && (
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.startDate), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isTomorrow(new Date(activity.startDate)) && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Mañana
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push('/calendar')}
              >
                <Calendar className="h-6 w-6" />
                <span>Ver Calendario</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push('/activities/new')}
              >
                <Plus className="h-6 w-6" />
                <span>Nueva Actividad</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}