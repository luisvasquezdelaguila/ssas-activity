'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';
import { useActivityStore } from '@/stores/activity-store';
import { useUserStore } from '@/stores/user-store';
import { CalendarDays, Plus, Eye, Edit, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Configurar moment en español
moment.locale('es');
const localizer = momentLocalizer(moment);

// Mensajes en español para el calendario
const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este rango',
  showMore: (total: number) => `+ Ver más (${total})`,
};

export default function CalendarPage() {
  const router = useRouter();
  const { currentUser, currentCompany } = useAuthStore();
  const { activities, getActivitiesByUser, getActivitiesByCompany, deleteActivity } = useActivityStore();
  const { getUsersByCompany } = useUserStore();
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'user' | 'company'>('user');
  const [currentView, setCurrentView] = useState<View>('week');

  // Cargar actividades según el modo de vista
  useEffect(() => {
    if (!currentUser) return;

    let activitiesToShow: any[] = [];

    if (viewMode === 'user') {
      activitiesToShow = getActivitiesByUser(currentUser.id);
    } else if (viewMode === 'company' && currentCompany && 
               (currentUser.role === 'company_admin' || currentUser.role === 'operator')) {
      activitiesToShow = getActivitiesByCompany(currentCompany.id);
    }

    // Convertir actividades a eventos del calendario
    const events = activitiesToShow.map(activity => ({
      id: activity.id,
      title: activity.title,
      start: new Date(activity.startDate),
      end: new Date(activity.endDate),
      resource: {
        ...activity,
        userName: getUserName(activity.userId),
      },
    }));

    setCalendarEvents(events);
  }, [currentUser, currentCompany, activities, viewMode, getActivitiesByUser, getActivitiesByCompany]);

  const getUserName = (userId: string) => {
    if (!currentCompany) return 'Usuario';
    const companyUsers = getUsersByCompany(currentCompany.id);
    const user = companyUsers.find(u => u.id === userId);
    return user?.name || 'Usuario';
  };

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  }, []);

  const handleSelectSlot = useCallback((slotInfo: any) => {
    // Navegar a crear nueva actividad con fecha preseleccionada
    const startDate = moment(slotInfo.start).format('YYYY-MM-DDTHH:mm');
    const endDate = moment(slotInfo.end).format('YYYY-MM-DDTHH:mm');
    router.push(`/activities/new?start=${startDate}&end=${endDate}`);
  }, [router]);

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      try {
        await deleteActivity(selectedEvent.id);
        setIsEventDialogOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad';
    
    // Diferentes colores según el usuario (para vista de empresa)
    if (viewMode === 'company' && event.resource.userId !== currentUser?.id) {
      const colors = ['#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];
      const userIndex = event.resource.userId.charCodeAt(0) % colors.length;
      backgroundColor = colors[userIndex];
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const canViewCompany = currentUser?.role === 'company_admin' || currentUser?.role === 'operator';
  const canEditEvent = selectedEvent && (
    currentUser?.role === 'super_admin' || 
    selectedEvent.resource.userId === currentUser?.id ||
    (currentUser?.role === 'company_admin' && selectedEvent.resource.companyId === currentCompany?.id)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Calendario
            </h1>
            <p className="text-gray-600">
              {viewMode === 'user' ? 'Tus actividades' : `Actividades de ${currentCompany?.name}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {canViewCompany && (
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'user' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('user')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mis Actividades
                </Button>
                <Button
                  variant={viewMode === 'company' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('company')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Empresa
                </Button>
              </div>
            )}
            
            <Button onClick={() => router.push('/activities/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Actividad
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5" />
              <span>Vista de Calendario</span>
            </CardTitle>
            <CardDescription>
              Haz clic en una fecha para crear una nueva actividad o en un evento para ver detalles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                messages={messages}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                eventPropGetter={eventStyleGetter}
                view={currentView}
                onView={setCurrentView}
                popup
                style={{ height: '100%' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Details Dialog */}
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <DialogDescription>
                Detalles de la actividad
              </DialogDescription>
            </DialogHeader>
            
            {selectedEvent && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Descripción</h4>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.resource.description || 'Sin descripción'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Inicio</h4>
                    <p className="text-sm text-gray-600">
                      {format(selectedEvent.start, 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Fin</h4>
                    <p className="text-sm text-gray-600">
                      {format(selectedEvent.end, 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>

                {viewMode === 'company' && selectedEvent.resource.userId !== currentUser?.id && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Usuario</h4>
                    <Badge variant="outline">
                      {selectedEvent.resource.userName}
                    </Badge>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEventDialogOpen(false)}
                  >
                    Cerrar
                  </Button>
                  
                  {canEditEvent && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          router.push(`/activities/${selectedEvent.id}/edit`);
                          setIsEventDialogOpen(false);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      
                      <Button
                        variant="destructive"
                        onClick={handleDeleteEvent}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}