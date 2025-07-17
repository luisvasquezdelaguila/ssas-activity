'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';
import { useActivityStore } from '@/stores/activity-store';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Calendar,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isThisWeek, isThisMonth, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProductivityReportPage() {
  const { currentUser } = useAuthStore();
  const { getActivitiesByUser } = useActivityStore();
  const [productivityData, setProductivityData] = useState<any>({});

  useEffect(() => {
    if (!currentUser) return;

    const userActivities = getActivitiesByUser(currentUser.id);
    const now = new Date();
    
    // Actividades de esta semana
    const thisWeekActivities = userActivities.filter(activity => 
      isThisWeek(new Date(activity.startDate))
    );
    
    // Actividades de este mes
    const thisMonthActivities = userActivities.filter(activity => 
      isThisMonth(new Date(activity.startDate))
    );

    // Calcular horas trabajadas
    const calculateHours = (activities: any[]) => {
      return activities.reduce((total, activity) => {
        const hours = differenceInHours(new Date(activity.endDate), new Date(activity.startDate));
        return total + hours;
      }, 0);
    };

    const weeklyHours = calculateHours(thisWeekActivities);
    const monthlyHours = calculateHours(thisMonthActivities);

    // Actividades completadas vs pendientes
    const completedThisWeek = thisWeekActivities.filter(a => new Date(a.endDate) < now).length;
    const completedThisMonth = thisMonthActivities.filter(a => new Date(a.endDate) < now).length;

    // Patrones de productividad por hora
    const hourlyPattern = Array(24).fill(0);
    userActivities.forEach(activity => {
      const hour = new Date(activity.startDate).getHours();
      hourlyPattern[hour]++;
    });

    // Encontrar horas más productivas
    const mostProductiveHour = hourlyPattern.indexOf(Math.max(...hourlyPattern));
    
    // Racha de días consecutivos con actividades
    const calculateStreak = () => {
      const dates = [...new Set(userActivities.map(a => 
        format(new Date(a.startDate), 'yyyy-MM-dd')
      ))].sort().reverse();
      
      let streak = 0;
      const today = format(now, 'yyyy-MM-dd');
      
      for (let i = 0; i < dates.length; i++) {
        const expectedDate = format(new Date(now.getTime() - i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        if (dates.includes(expectedDate)) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    };

    const currentStreak = calculateStreak();

    // Objetivos (simulados - podrías hacer esto configurable)
    const weeklyGoal = 40; // horas
    const monthlyGoal = 160; // horas
    const dailyGoal = 8; // horas

    setProductivityData({
      weeklyHours,
      monthlyHours,
      weeklyGoal,
      monthlyGoal,
      dailyGoal,
      completedThisWeek,
      completedThisMonth,
      totalThisWeek: thisWeekActivities.length,
      totalThisMonth: thisMonthActivities.length,
      mostProductiveHour,
      currentStreak,
      hourlyPattern
    });
  }, [currentUser, getActivitiesByUser]);

  const getProductivityLevel = (hours: number, goal: number) => {
    const percentage = (hours / goal) * 100;
    if (percentage >= 100) return { level: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 80) return { level: 'Muy Bueno', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 60) return { level: 'Bueno', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Mejorable', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const weeklyLevel = getProductivityLevel(productivityData.weeklyHours || 0, productivityData.weeklyGoal || 40);
  const monthlyLevel = getProductivityLevel(productivityData.monthlyHours || 0, productivityData.monthlyGoal || 160);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Productividad</h1>
          <p className="text-gray-600">
            Análisis personal de tu rendimiento y patrones de trabajo
          </p>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas Esta Semana</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productivityData.weeklyHours || 0}h</div>
              <div className="mt-2">
                <Progress 
                  value={(productivityData.weeklyHours / productivityData.weeklyGoal) * 100} 
                  className="h-2"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Meta: {productivityData.weeklyGoal}h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas Este Mes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productivityData.monthlyHours || 0}h</div>
              <div className="mt-2">
                <Progress 
                  value={(productivityData.monthlyHours / productivityData.monthlyGoal) * 100} 
                  className="h-2"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Meta: {productivityData.monthlyGoal}h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productivityData.currentStreak || 0}</div>
              <p className="text-xs text-muted-foreground">
                días consecutivos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productivityData.totalThisWeek > 0 
                  ? Math.round((productivityData.completedThisWeek / productivityData.totalThisWeek) * 100)
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                esta semana
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Nivel de Productividad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Nivel de Productividad Semanal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge className={`${weeklyLevel.bgColor} ${weeklyLevel.color} border-0`}>
                  {weeklyLevel.level}
                </Badge>
                <span className="text-2xl font-bold">
                  {Math.round((productivityData.weeklyHours / productivityData.weeklyGoal) * 100)}%
                </span>
              </div>
              <Progress 
                value={(productivityData.weeklyHours / productivityData.weeklyGoal) * 100} 
                className="h-3"
              />
              <p className="text-sm text-gray-600 mt-2">
                {productivityData.weeklyHours}h de {productivityData.weeklyGoal}h objetivo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Nivel de Productividad Mensual</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge className={`${monthlyLevel.bgColor} ${monthlyLevel.color} border-0`}>
                  {monthlyLevel.level}
                </Badge>
                <span className="text-2xl font-bold">
                  {Math.round((productivityData.monthlyHours / productivityData.monthlyGoal) * 100)}%
                </span>
              </div>
              <Progress 
                value={(productivityData.monthlyHours / productivityData.monthlyGoal) * 100} 
                className="h-3"
              />
              <p className="text-sm text-gray-600 mt-2">
                {productivityData.monthlyHours}h de {productivityData.monthlyGoal}h objetivo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Patrones de Productividad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Patrones de Productividad</span>
            </CardTitle>
            <CardDescription>
              Análisis de tus horas más productivas del día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-blue-900">Hora Más Productiva</h3>
                  <p className="text-sm text-blue-700">
                    {productivityData.mostProductiveHour}:00 - {productivityData.mostProductiveHour + 1}:00
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>

              <div className="grid grid-cols-12 gap-1">
                {Array.from({ length: 24 }, (_, hour) => {
                  const count = productivityData.hourlyPattern?.[hour] || 0;
                  const maxCount = Math.max(...(productivityData.hourlyPattern || [1]));
                  const intensity = maxCount > 0 ? count / maxCount : 0;
                  const isTopHour = hour === productivityData.mostProductiveHour;
                  
                  return (
                    <div
                      key={hour}
                      className={`p-1 text-center rounded text-xs ${
                        isTopHour ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${intensity * 0.8})`,
                        color: intensity > 0.5 ? 'white' : 'black'
                      }}
                      title={`${hour}:00 - ${count} actividades`}
                    >
                      <div className="font-medium">{hour}</div>
                      <div>{count}</div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 text-center">
                Horas del día (0-23) con número de actividades
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recomendaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Recomendaciones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productivityData.weeklyHours < productivityData.weeklyGoal * 0.8 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Aumentar Horas Semanales</h4>
                    <p className="text-sm text-yellow-700">
                      Estás por debajo de tu objetivo semanal. Considera programar más actividades.
                    </p>
                  </div>
                </div>
              )}
              
              {productivityData.currentStreak === 0 && (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Construir Consistencia</h4>
                    <p className="text-sm text-blue-700">
                      Intenta trabajar en actividades todos los días para construir una racha.
                    </p>
                  </div>
                </div>
              )}
              
              {productivityData.mostProductiveHour && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Optimizar Horarios</h4>
                    <p className="text-sm text-green-700">
                      Tu hora más productiva es {productivityData.mostProductiveHour}:00. 
                      Considera programar tareas importantes en este horario.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}