'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';
import { useActivityStore } from '@/stores/activity-store';
import { useUserStore } from '@/stores/user-store';
import { Area } from '@/types';
import { 
  ArrowLeft, 
  Users, 
  Activity, 
  Plus, 
  Calendar,
  Clock,
  UserPlus,
  Edit,
  Trash2,
  Mail
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AreaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const areaId = params.id as string;
  
  const { currentUser, currentCompany } = useAuthStore();
  const { activities, getActivitiesByCompany, createActivity } = useActivityStore();
  const { getUsersByCompany } = useUserStore();
  
  const [area, setArea] = useState<Area | null>(null);
  const [areaActivities, setAreaActivities] = useState<any[]>([]);
  const [areaUsers, setAreaUsers] = useState<any[]>([]);
  const [isCreateActivityOpen, setIsCreateActivityOpen] = useState(false);
  
  // Form states for new activity
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityStartDate, setActivityStartDate] = useState('');
  const [activityEndDate, setActivityEndDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentCompany || !areaId) return;
    
    // Cargar área específica
    const areasRaw = localStorage.getItem("saas-platform-areas");
    let allAreas: Area[] = areasRaw ? JSON.parse(areasRaw) : [];
    const foundArea = allAreas.find(a => a.id === areaId && a.companyId === currentCompany.id);
    setArea(foundArea || null);

    // Cargar actividades del área
    const companyActivities = getActivitiesByCompany(currentCompany.id);
    const filteredActivities = companyActivities.filter(activity => activity.areaId === areaId);
    setAreaActivities(filteredActivities);

    // Cargar usuarios del área
    const companyUsers = getUsersByCompany(currentCompany.id);
    const filteredUsers = companyUsers.filter(user => user.areaId === areaId);
    setAreaUsers(filteredUsers);
  }, [currentCompany, areaId, activities, getActivitiesByCompany, getUsersByCompany]);

  const handleCreateActivity = async () => {
    if (!activityTitle || !activityStartDate || !activityEndDate || !selectedUserId || !currentCompany || !area) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      const activityData = {
        title: activityTitle,
        description: activityDescription,
        startDate: new Date(activityStartDate),
        endDate: new Date(activityEndDate),
      };

      // Crear actividad con areaId
      const newActivity = await createActivity(activityData, selectedUserId, currentCompany.id);
      
      // Actualizar la actividad para incluir el areaId
      const activitiesRaw = localStorage.getItem('saas-platform-activities');
      let allActivities = activitiesRaw ? JSON.parse(activitiesRaw) : [];
      
      // Encontrar y actualizar la actividad recién creada
      allActivities = allActivities.map((act: any) => {
        if (act.id === newActivity.id) {
          return {
            ...act,
            areaId: area.id
          };
        }
        return act;
      });
      
      localStorage.setItem('saas-platform-activities', JSON.stringify(allActivities));
      
      // Limpiar formulario
      setActivityTitle('');
      setActivityDescription('');
      setActivityStartDate('');
      setActivityEndDate('');
      setSelectedUserId('');
      setIsCreateActivityOpen(false);
      
      // Recargar actividades
      const companyActivities = getActivitiesByCompany(currentCompany.id);
      const filteredActivities = companyActivities.filter(activity => activity.areaId === areaId);
      setAreaActivities(filteredActivities);
      
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Error al crear la actividad');
    } finally {
      setIsLoading(false);
    }
  };

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

  const todayActivities = areaActivities.filter(activity => 
    isToday(new Date(activity.startDate))
  );

  const upcomingActivities = areaActivities.filter(activity => 
    new Date(activity.startDate) > new Date() && !isToday(new Date(activity.startDate))
  ).slice(0, 5);

  if (!area) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Área no encontrada</h1>
          <Button onClick={() => router.push('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{area.name}</h1>
              <p className="text-gray-600">
                {area.description || 'Gestión del área y sus actividades'}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Dialog open={isCreateActivityOpen} onOpenChange={setIsCreateActivityOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Actividad
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crear Actividad para {area.name}</DialogTitle>
                  <DialogDescription>
                    Asigna una nueva actividad a un usuario de esta área
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={activityTitle}
                      onChange={(e) => setActivityTitle(e.target.value)}
                      placeholder="Título de la actividad"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={activityDescription}
                      onChange={(e) => setActivityDescription(e.target.value)}
                      placeholder="Descripción de la actividad"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="user">Usuario Asignado *</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        {areaUsers.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Fecha Inicio *</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={activityStartDate}
                        onChange={(e) => setActivityStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">Fecha Fin *</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={activityEndDate}
                        onChange={(e) => setActivityEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateActivityOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateActivity} disabled={isLoading}>
                      {isLoading ? 'Creando...' : 'Crear Actividad'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={() => router.push(`/admin/areas/${area.id}/users`)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Gestionar Usuarios
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{areaUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                En esta área
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actividades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{areaActivities.length}</div>
              <p className="text-xs text-muted-foreground">
                Todas las actividades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayActivities.length}</div>
              <p className="text-xs text-muted-foreground">
                Actividades hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximas</CardTitle>
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

        {/* Usuarios del Área */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Usuarios del Área</span>
              </CardTitle>
              <Button variant="outline" onClick={() => router.push(`/admin/areas/${area.id}/users`)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Usuario
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {areaUsers.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No hay usuarios asignados a esta área</p>
                <Button onClick={() => router.push(`/admin/areas/${area.id}/users`)}>
                  Agregar primer usuario
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {areaUsers.map((user) => {
                  const userActivities = areaActivities.filter(act => act.userId === user.id);
                  
                  return (
                    <Card key={user.id} className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {userActivities.length} actividades
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actividades de Hoy */}
        {todayActivities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Actividades de Hoy</CardTitle>
              <CardDescription>
                Actividades programadas para hoy en {area.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayActivities.map((activity) => {
                  const user = areaUsers.find(u => u.id === activity.userId);
                  
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
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(getActivityStatus(activity))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Todas las Actividades */}
        <Card>
          <CardHeader>
            <CardTitle>Todas las Actividades</CardTitle>
            <CardDescription>
              Historial completo de actividades en {area.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {areaActivities.length === 0 ? (
              <div className="text-center py-6">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No hay actividades en esta área</p>
                <Button onClick={() => setIsCreateActivityOpen(true)}>
                  Crear primera actividad
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {areaActivities.map((activity) => {
                  const user = areaUsers.find(u => u.id === activity.userId);
                  
                  return (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{activity.title}</h3>
                        {activity.description && (
                          <p className="text-sm text-gray-600">{activity.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>
                            {format(new Date(activity.startDate), 'dd/MM/yyyy HH:mm', { locale: es })} - 
                            {format(new Date(activity.endDate), 'HH:mm', { locale: es })}
                          </span>
                          {user && <span>👤 {user.name}</span>}
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
      </div>
    </DashboardLayout>
  );
}