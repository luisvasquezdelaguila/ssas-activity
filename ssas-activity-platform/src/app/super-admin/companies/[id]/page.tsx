'use client';

import { useEffect, useState } from 'react';
import { Select } from '@/components/ui/select';
import { usePlanStore } from '@/stores/plan-store';
import { seedPlansToLocalStorage } from '@/lib/init-data';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';
import { useCompanyStore } from '@/stores/company-store';
import { useUserStore } from '@/stores/user-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateCompanySchema, type UpdateCompanyFormData } from '@/lib/validations';
import { ArrowLeft, Building2, Users, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;
  
  const { currentUser } = useAuthStore();
  const { companies, updateCompany, getCompanyById, isLoading, error } = useCompanyStore();
  const { users, getUsersByCompany } = useUserStore();
  const { plans, setPlans } = usePlanStore ? usePlanStore() : { plans: [], setPlans: () => {} };
  
  const [company, setCompany] = useState<any>(null);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateCompanyFormData>({
    resolver: zodResolver(updateCompanySchema),
  });

  const watchIsActive = watch('isActive');

  useEffect(() => {
    if (currentUser?.role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }

    // Inicializar planes si no están en el store
    if (!plans || plans.length === 0) {
      seedPlansToLocalStorage();
      const plansRaw = localStorage.getItem('saas-platform-plans');
      if (plansRaw) {
        setPlans(JSON.parse(plansRaw));
      }
    }

    const foundCompany = getCompanyById(companyId);
    if (foundCompany) {
      setCompany(foundCompany);
      setCompanyUsers(getUsersByCompany(companyId));
      // Llenar el formulario con los datos actuales
      reset({
        name: foundCompany.name,
        domain: foundCompany.domain,
        planId: foundCompany.planId || '',
        isActive: foundCompany.isActive,
        settings: {
          timezone: foundCompany.settings.timezone,
          workingHours: {
            start: foundCompany.settings.workingHours.start,
            end: foundCompany.settings.workingHours.end,
          },
          allowUserSelfRegistration: foundCompany.settings.allowUserSelfRegistration,
        },
      });
    } else {
      router.push('/super-admin');
    }
  }, [currentUser, router, companyId, getCompanyById, getUsersByCompany, reset, plans, setPlans]);

  const onSubmit = async (data: UpdateCompanyFormData) => {
    try {
      // Buscar el plan seleccionado
      const selectedPlan = plans.find(p => p.id === data.planId);
      await updateCompany(companyId, { ...data, plan: selectedPlan });
      router.push('/super-admin');
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  if (currentUser?.role !== 'super_admin' || !company) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/super-admin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Empresa
            </h1>
            <p className="text-gray-600">
              Modifica la información de {company.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de edición */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Información de la Empresa</span>
                </CardTitle>
                <CardDescription>
                  Actualiza los datos básicos de la empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre de la Empresa</Label>
                      <Input
                        id="name"
                        placeholder="Ej: Mi Empresa S.A."
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="domain">Dominio</Label>
                      <Input
                        id="domain"
                        placeholder="Ej: miempresa.com"
                        {...register('domain')}
                      />
                      {errors.domain && (
                        <p className="text-sm text-red-600">{errors.domain.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="planId">Plan</Label>
                      <select
                        id="planId"
                        className="w-full border rounded px-2 py-2"
                        value={watch('planId')}
                        onChange={e => setValue('planId', e.target.value)}
                      >
                        <option value="" disabled>Selecciona un plan</option>
                        {plans && plans.map((plan: any) => (
                          <option key={plan.id} value={plan.id}>{plan.name}</option>
                        ))}
                      </select>
                      {errors.planId && (
                        <p className="text-sm text-red-600">{errors.planId.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Configuración</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Zona Horaria</Label>
                      <Input
                        id="timezone"
                        placeholder="America/Mexico_City"
                        {...register('settings.timezone')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Hora de Inicio</Label>
                        <Input
                          id="startTime"
                          type="time"
                          {...register('settings.workingHours.start')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">Hora de Fin</Label>
                        <Input
                          id="endTime"
                          type="time"
                          {...register('settings.workingHours.end')}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="selfRegistration"
                        onCheckedChange={(checked) => 
                          setValue('settings.allowUserSelfRegistration', checked)
                        }
                        defaultChecked={company.settings.allowUserSelfRegistration}
                      />
                      <Label htmlFor="selfRegistration">
                        Permitir auto-registro de usuarios
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        onCheckedChange={(checked) => setValue('isActive', checked)}
                        defaultChecked={company.isActive}
                      />
                      <Label htmlFor="isActive">
                        Empresa activa
                      </Label>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/super-admin')}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Información adicional */}
          <div className="space-y-6">
            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Estadísticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total de usuarios</p>
                  <p className="text-2xl font-bold">{companyUsers.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usuarios activos</p>
                  <p className="text-2xl font-bold">
                    {companyUsers.filter(u => u.isActive).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de creación</p>
                  <p className="text-sm font-medium">
                    {format(new Date(company.createdAt), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Usuarios de la empresa */}
            <Card>
              <CardHeader>
                <CardTitle>Usuarios</CardTitle>
                <CardDescription>
                  Lista de usuarios de esta empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                {companyUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay usuarios registrados</p>
                ) : (
                  <div className="space-y-2">
                    {companyUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {user.role.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                    {companyUsers.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{companyUsers.length - 5} usuarios más
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}