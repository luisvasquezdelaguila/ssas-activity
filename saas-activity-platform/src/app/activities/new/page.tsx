'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';
import { useActivityStore } from '@/stores/activity-store';
import { useForm } from 'react-hook-form';
import { useUserStore } from '@/stores/user-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createActivitySchema } from '@/lib/validations';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

export default function NewActivityPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, currentCompany } = useAuthStore();
  const { getUsersByCompany } = useUserStore();
  const { createActivity, isLoading, error } = useActivityStore();
  const [showError, setShowError] = useState(false);

  // Obtener valores de la URL si existen
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');

  // Formato: 'YYYY-MM-DDTHH:mm' (ya viene así de calendar)
  // Para datetime-local inputs, necesitamos el formato string, no Date objects
  const formatDateForInput = (val: string | null) => {
    if (!val) return '';
    // El formato que viene del calendario ya es correcto: 'YYYY-MM-DDTHH:mm'
    return val;
  };
  
  const defaultValues = {
    startDate: formatDateForInput(startParam),
    endDate: formatDateForInput(endParam),
  };

  // Extender el schema para incluir userId opcional y manejar strings de datetime-local
  const extendedSchema = z.object({
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().optional(),
    startDate: z.string().min(1, 'La fecha de inicio es requerida'),
    endDate: z.string().min(1, 'La fecha de fin es requerida'),
    userId: z.string().optional(),
  }).refine((data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  }, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endDate'],
  });

  type ExtendedActivityFormData = z.infer<typeof extendedSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ExtendedActivityFormData>({
    resolver: zodResolver(extendedSchema),
    defaultValues,
  });

  // Si los params cambian después de montar, actualiza los valores
  useEffect(() => {
    const startDate = formatDateForInput(startParam);
    const endDate = formatDateForInput(endParam);
    if (startDate) setValue('startDate', startDate);
    if (endDate) setValue('endDate', endDate);
  }, [startParam, endParam, setValue]);

  // Determinar si puede seleccionar usuario
  const canSelectUser = currentUser?.role === 'company_admin' || currentUser?.role === 'operator';
  const companyUsers = (canSelectUser && currentCompany) ? getUsersByCompany(currentCompany.id) : [];

  const onSubmit = async (data: ExtendedActivityFormData) => {
    try {
      if (!currentUser || !currentCompany) return;
      setShowError(false);
      // Si puede seleccionar usuario, usar el seleccionado, si no, el actual
      const userId = canSelectUser ? data.userId || '' : currentUser.id;
      if (!userId) throw new Error('Debes seleccionar un usuario');
      
      // Convertir las fechas de string a Date objects para el store
      const activityData = {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
      
      await createActivity(activityData, userId, currentCompany.id);
      router.push('/calendar');
    } catch (error) {
      setShowError(true);
      console.error('Error creating activity:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nueva Actividad
            </h1>
            <p className="text-gray-600">
              Crea una nueva actividad en tu calendario
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Detalles de la Actividad</span>
            </CardTitle>
            <CardDescription>
              Completa la información de tu nueva actividad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {canSelectUser && (
                <div className="space-y-2">
                  <Label htmlFor="userId">Usuario *</Label>
                  <select
                    id="userId"
                    {...register('userId', { required: true })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Selecciona un usuario</option>
                    {companyUsers.map((user) => (
                      <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                    ))}
                  </select>
                  {errors.userId && (
                    <p className="text-sm text-red-600">Debes seleccionar un usuario</p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Reunión de equipo"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe los detalles de la actividad..."
                  rows={3}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha y Hora de Inicio *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    {...register('startDate')}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha y Hora de Fin *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...register('endDate')}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-600">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {(error || showError) && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                  {error || 'Error al crear la actividad'}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creando...' : 'Crear Actividad'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Consejos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Usa títulos descriptivos para identificar fácilmente tus actividades</li>
              <li>• La descripción te ayudará a recordar detalles importantes</li>
              <li>• Asegúrate de que la hora de fin sea posterior a la de inicio</li>
              <li>• Puedes editar o eliminar la actividad después de crearla</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}