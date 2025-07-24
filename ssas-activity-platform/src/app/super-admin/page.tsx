'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';
import { useCompanyStore } from '@/stores/company-store';
import { usePlanStore } from '@/stores/plan-store';
import { useUserStore } from '@/stores/user-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCompanySchema, type CreateCompanyFormData } from '@/lib/validations';
import { Building2, Users, Plus, Settings, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SuperAdminPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { companies, createCompany, deleteCompany, isLoading, error } = useCompanyStore();
  const { plans } = usePlanStore();
  const { users } = useUserStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
  });

  useEffect(() => {
    if (currentUser?.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const onSubmit = async (data: CreateCompanyFormData) => {
    try {
      await createCompany(data);
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (confirm('¿Estás seguro de que quieres desactivar esta empresa?')) {
      try {
        await deleteCompany(companyId);
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const activeCompanies = companies.filter(company => company.isActive);
  const totalUsers = users.filter(user => user.isActive).length;

  if (currentUser?.role !== 'super_admin') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Super Administrador
            </h1>
            <p className="text-gray-600">
              Gestiona todas las empresas de la plataforma
            </p>
          </div>
          
          <Button
            variant="default"
            onClick={() => router.push('/super-admin/companies/new')}
            className="ml-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Empresa
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Empresas Activas
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCompanies.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeCompanies.length === 1 ? 'empresa registrada' : 'empresas registradas'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Usuarios
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Empresas Totales
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">
                Incluyendo inactivas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Empresas Registradas</CardTitle>
            <CardDescription>
              Lista de todas las empresas en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <div className="text-center py-6">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay empresas registradas</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Crear primera empresa
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Dominio</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => {
                    const companyUsers = users.filter(user => user.companyId === company.id && user.isActive);
                    // Prefer company.plan.name if available, fallback to plan store lookup
                    const planName = company.plan?.name || (plans.find(p => p.id === company.planId)?.name) || 'Sin plan';
                    return (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">
                          {company.name}
                        </TableCell>
                        <TableCell>{company.domain}</TableCell>
                        <TableCell>{planName}</TableCell>
                        <TableCell>
                          {company.isActive ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Activa
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Inactiva
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{companyUsers.length}</TableCell>
                        <TableCell>
                          {format(new Date(company.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/super-admin/companies/${company.id}`)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Editar empresa"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {company.isActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCompany(company.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Desactivar empresa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}