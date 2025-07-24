'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';
import { useActivityStore } from '@/stores/activity-store';
import { useUserStore } from '@/stores/user-store';
import {
    BarChart3,
    TrendingUp,
    Clock,
    Calendar,
    Activity,
    Download,
    Filter
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ReportsPage() {
    const { currentUser, currentCompany } = useAuthStore();
    const { activities, getActivitiesByCompany, getActivitiesByUser } = useActivityStore();
    const { getUsersByCompany } = useUserStore();

    const [dateRange, setDateRange] = useState({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
    });
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [reportData, setReportData] = useState<{
        totalActivities: number;
        completedActivities: number;
        totalHours: number;
        dayStats: number[];
        userStats: Record<string, number>;
        hourStats: number[];
        activities: any[];
    }>({
        totalActivities: 0,
        completedActivities: 0,
        totalHours: 0,
        dayStats: [],
        userStats: {},
        hourStats: [],
        activities: []
    });

    const canViewCompanyReports = useMemo(() =>
        currentUser?.role === 'company_admin' || currentUser?.role === 'super_admin',
        [currentUser?.role]
    );

    useEffect(() => {
        if (!currentUser || !currentCompany) return;

        const companyUsers = canViewCompanyReports && currentCompany ? getUsersByCompany(currentCompany.id) : [];
        let activitiesToAnalyze = [];

        if (selectedUser === 'all' && canViewCompanyReports) {
            activitiesToAnalyze = getActivitiesByCompany(currentCompany.id);
        } else if (selectedUser !== 'all') {
            activitiesToAnalyze = getActivitiesByUser(selectedUser);
        } else {
            activitiesToAnalyze = getActivitiesByUser(currentUser.id);
        }

        // Filtrar por rango de fechas
        const filteredActivities = activitiesToAnalyze.filter(activity => {
            const activityDate = new Date(activity.startDate);
            return isWithinInterval(activityDate, { start: dateRange.from, end: dateRange.to });
        });

        // Calcular métricas
        const totalActivities = filteredActivities.length;
        const completedActivities = filteredActivities.filter(a => new Date(a.endDate) < new Date()).length;
        const totalHours = filteredActivities.reduce((acc, activity) => {
            const duration = (new Date(activity.endDate).getTime() - new Date(activity.startDate).getTime()) / (1000 * 60 * 60);
            return acc + duration;
        }, 0);

        // Actividades por día de la semana
        const dayStats = Array(7).fill(0);
        filteredActivities.forEach(activity => {
            const day = new Date(activity.startDate).getDay();
            dayStats[day]++;
        });

        // Actividades por usuario (solo para admins)
        const userStats: Record<string, number> = {};
        if (canViewCompanyReports) {
            filteredActivities.forEach((activity: any) => {
                const user = companyUsers.find(u => u.id === activity.userId);
                const userName = user?.name || 'Usuario desconocido';
                userStats[userName] = (userStats[userName] || 0) + 1;
            });
        }

        // Actividades por hora del día
        const hourStats = Array(24).fill(0);
        filteredActivities.forEach(activity => {
            const hour = new Date(activity.startDate).getHours();
            hourStats[hour]++;
        });

        setReportData({
            totalActivities,
            completedActivities,
            totalHours,
            dayStats,
            userStats,
            hourStats,
            activities: filteredActivities
        });
    }, [
        currentUser?.id,
        currentCompany?.id,
        activities,
        dateRange.from,
        dateRange.to,
        selectedUser,
        canViewCompanyReports,
        getActivitiesByCompany,
        getActivitiesByUser,
        getUsersByCompany
    ]);

    const companyUsers = useMemo(() =>
        canViewCompanyReports && currentCompany ? getUsersByCompany(currentCompany.id) : [],
        [canViewCompanyReports, currentCompany, getUsersByCompany]
    );

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
                        <p className="text-gray-600">
                            Análisis detallado de actividades y productividad
                        </p>
                    </div>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Filter className="h-5 w-5" />
                            <span>Filtros</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-sm font-medium mb-2 block">Rango de Fechas</label>
                                <DatePickerWithRange
                                    date={dateRange}
                                    onDateChange={(date) => {
                                        if (date?.from && date?.to) {
                                            setDateRange({ from: date.from, to: date.to });
                                        }
                                    }}
                                />
                            </div>

                            {canViewCompanyReports && (
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-sm font-medium mb-2 block">Usuario</label>
                                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar usuario" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los usuarios</SelectItem>
                                            {companyUsers.map(user => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Actividades</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportData.totalActivities || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                En el período seleccionado
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportData.completedActivities || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {reportData.totalActivities > 0
                                    ? `${Math.round((reportData.completedActivities / reportData.totalActivities) * 100)}% del total`
                                    : '0% del total'
                                }
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Math.round(reportData.totalHours || 0)}</div>
                            <p className="text-xs text-muted-foreground">
                                Horas de actividades
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {reportData.totalActivities > 0
                                    ? Math.round(reportData.totalActivities / 30)
                                    : 0
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Actividades por día
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficos y Análisis */}
                <Tabs defaultValue="weekly" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="weekly">Análisis Semanal</TabsTrigger>
                        <TabsTrigger value="hourly">Distribución Horaria</TabsTrigger>
                        {canViewCompanyReports && <TabsTrigger value="users">Por Usuario</TabsTrigger>}
                        <TabsTrigger value="details">Detalles</TabsTrigger>
                    </TabsList>

                    <TabsContent value="weekly" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Actividades por Día de la Semana</CardTitle>
                                <CardDescription>
                                    Distribución de actividades a lo largo de la semana
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {dayNames.map((day, index) => {
                                        const count = reportData.dayStats?.[index] || 0;
                                        const maxCount = Math.max(...(reportData.dayStats || [1]));
                                        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                                        return (
                                            <div key={day} className="flex items-center space-x-3">
                                                <div className="w-12 text-sm font-medium">{day}</div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className="w-8 text-sm text-gray-600">{count}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="hourly" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Distribución por Hora del Día</CardTitle>
                                <CardDescription>
                                    Horas más activas del día
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-6 gap-2">
                                    {Array.from({ length: 24 }, (_, hour) => {
                                        const count = reportData.hourStats?.[hour] || 0;
                                        const maxCount = Math.max(...(reportData.hourStats || [1]));
                                        const intensity = maxCount > 0 ? count / maxCount : 0;

                                        return (
                                            <div
                                                key={hour}
                                                className="p-2 text-center rounded border"
                                                style={{
                                                    backgroundColor: `rgba(59, 130, 246, ${intensity * 0.8})`,
                                                    color: intensity > 0.5 ? 'white' : 'black'
                                                }}
                                            >
                                                <div className="text-xs font-medium">{hour}:00</div>
                                                <div className="text-xs">{count}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {canViewCompanyReports && (
                        <TabsContent value="users" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actividades por Usuario</CardTitle>
                                    <CardDescription>
                                        Distribución de actividades entre usuarios
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(reportData.userStats || {}).map(([userName, count]) => {
                                            const maxCount = Math.max(...Object.values(reportData.userStats || { default: 1 }));
                                            const percentage = maxCount > 0 ? ((count as number) / maxCount) * 100 : 0;

                                            return (
                                                <div key={userName} className="flex items-center space-x-3">
                                                    <div className="w-32 text-sm font-medium truncate">{userName}</div>
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="w-8 text-sm text-gray-600">{count as number}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    <TabsContent value="details" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lista Detallada de Actividades</CardTitle>
                                <CardDescription>
                                    Todas las actividades en el período seleccionado
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {reportData.activities?.length > 0 ? (
                                        reportData.activities.map((activity) => (
                                            <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{activity.title}</h3>
                                                    {activity.description && (
                                                        <p className="text-sm text-gray-600">{activity.description}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500">
                                                        {format(new Date(activity.startDate), 'dd/MM/yyyy HH:mm', { locale: es })} -
                                                        {format(new Date(activity.endDate), 'HH:mm', { locale: es })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant={new Date(activity.endDate) < new Date() ? 'secondary' : 'outline'}>
                                                        {new Date(activity.endDate) < new Date() ? 'Completada' : 'Pendiente'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6">
                                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">No hay actividades en el período seleccionado</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}