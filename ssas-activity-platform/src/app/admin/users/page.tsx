'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import { Area } from '@/types';
import { Users, Plus, Settings, Trash2, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminUsersPage() {
  const router = useRouter();
  const { currentUser, currentCompany } = useAuthStore();
  const { users, deleteUser, getUsersByCompany } = useUserStore();
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    if (currentUser?.role !== 'company_admin') {
      router.push('/dashboard');
      return;
    }
    if (currentCompany) {
      setCompanyUsers(getUsersByCompany(currentCompany.id));
      // Cargar áreas de la empresa
      const areasRaw = localStorage.getItem('saas-platform-areas');
      let allAreas: Area[] = areasRaw ? JSON.parse(areasRaw) : [];
      setAreas(allAreas.filter((a) => a.companyId === currentCompany.id));
    }
  }, [currentUser, currentCompany, getUsersByCompany, router]);

  const handleDeleteUser = async (userId: string) => {
    if (confirm('¿Estás seguro de que quieres desactivar este usuario?')) {
      await deleteUser(userId);
      if (currentCompany) {
        setCompanyUsers(getUsersByCompany(currentCompany.id));
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'company_admin':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Administrador</Badge>;
      case 'operator':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Operador</Badge>;
      case 'user':
        return <Badge variant="outline">Usuario</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (

    <DashboardLayout>
       {/* Header */}
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold text-gray-900">
             Gestión de Usuarios
           </h1>
           <p className="text-gray-600">
             Administra los usuarios de {currentCompany?.name}
           </p>
         </div>
         <Button onClick={() => router.push('/admin/users/new')}>
           <Plus className="h-4 w-4 mr-2" />
           Nuevo Usuario
         </Button>
       </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-5 gap-6 my-8">
         {/* Card de Áreas */}
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">
               Áreas
             </CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{areas.length}</div>
             <p className="text-xs text-muted-foreground">
               Total de áreas
             </p>
             {areas.length > 0 && (
               <ul className="mt-2 text-xs text-gray-600 space-y-1">
                 {areas.slice(0, 4).map((area) => (
                   <li key={area.id} className="truncate">{area.name}</li>
                 ))}
                 {areas.length > 4 && <li>...y más</li>}
               </ul>
             )}
             <Button
               variant="outline"
               size="sm"
               className="mt-3"
               onClick={() => router.push('/admin/areas')}
             >
               Ver todas
             </Button>
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
             <div className="text-2xl font-bold">{companyUsers.length}</div>
             <p className="text-xs text-muted-foreground">
               Usuarios activos
             </p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">
               Administradores
             </CardTitle>
             <UserCheck className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">
               {companyUsers.filter(u => u.role === 'company_admin').length}
             </div>
             <p className="text-xs text-muted-foreground">
               Con permisos admin
             </p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">
               Operadores
             </CardTitle>
             <Settings className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">
               {companyUsers.filter(u => u.role === 'operator').length}
             </div>
             <p className="text-xs text-muted-foreground">
               Supervisores
             </p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">
               Usuarios Finales
             </CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">
               {companyUsers.filter(u => u.role === 'user').length}
             </div>
             <p className="text-xs text-muted-foreground">
               Usuarios básicos
             </p>
           </CardContent>
         </Card>
       </div>

       {/* Users Table */}
       <Card>
         <CardHeader>
           <CardTitle>Usuarios de la Empresa</CardTitle>
           <CardDescription>
             Lista de todos los usuarios registrados en tu empresa
           </CardDescription>
         </CardHeader>
         <CardContent>
           {companyUsers.length === 0 ? (
             <div className="text-center py-6">
               <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
               <p className="text-gray-500">No hay usuarios registrados</p>
               <Button 
                 variant="outline" 
                 className="mt-2"
                 onClick={() => router.push('/admin/users/new')}
               >
                 Crear primer usuario
               </Button>
             </div>
           ) : (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Usuario</TableHead>
                   <TableHead>Email</TableHead>
                   <TableHead>Rol</TableHead>
                   <TableHead>Estado</TableHead>
                   <TableHead>Fecha de Creación</TableHead>
                   <TableHead>Acciones</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {companyUsers.map((user) => (
                   <TableRow key={user.id}>
                     <TableCell className="font-medium">
                       {user.name}
                     </TableCell>
                     <TableCell>{user.email}</TableCell>
                     <TableCell>
                       {getRoleBadge(user.role)}
                     </TableCell>
                     <TableCell>
                       {user.isActive ? (
                         <Badge variant="secondary" className="bg-green-100 text-green-800">
                           Activo
                         </Badge>
                       ) : (
                         <Badge variant="secondary" className="bg-red-100 text-red-800">
                           Inactivo
                         </Badge>
                       )}
                     </TableCell>
                     <TableCell>
                       {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: es })}
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center space-x-2">
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => router.push(`/admin/users/${user.id}`)}
                         >
                           <Settings className="h-4 w-4" />
                         </Button>
                         {user.isActive && user.id !== currentUser?.id && (
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleDeleteUser(user.id)}
                             className="text-red-600 hover:text-red-700"
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         )}
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           )}
         </CardContent>
       </Card>
    </DashboardLayout>
  );

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Usuarios
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Administradores
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companyUsers.filter(u => u.role === 'company_admin').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Con permisos admin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Operadores
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companyUsers.filter(u => u.role === 'operator').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Supervisores
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuarios Finales
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companyUsers.filter(u => u.role === 'user').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Usuarios básicos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios de la Empresa</CardTitle>
            <CardDescription>
              Lista de todos los usuarios registrados en tu empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {companyUsers.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay usuarios registrados</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => router.push('/admin/users/new')}
                >
                  Crear primer usuario
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          {user.isActive && user.id !== currentUser?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
    {/* Fin del componente */}
}