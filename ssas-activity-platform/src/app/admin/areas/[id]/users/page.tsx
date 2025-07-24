'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import { Area, User } from '@/types';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Mail,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export default function AreaUsersPage() {
  const router = useRouter();
  const params = useParams();
  const areaId = params.id as string;
  
  const { currentUser, currentCompany } = useAuthStore();
  const { getUsersByCompany } = useUserStore();
  
  const [area, setArea] = useState<Area | null>(null);
  const [areaUsers, setAreaUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form states for new user
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<'user' | 'operator'>('user');
  const [isUserActive, setIsUserActive] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!currentCompany || !areaId) return;
    
    // Cargar área específica
    const areasRaw = localStorage.getItem("saas-platform-areas");
    let allAreas: Area[] = areasRaw ? JSON.parse(areasRaw) : [];
    const foundArea = allAreas.find(a => a.id === areaId && a.companyId === currentCompany.id);
    setArea(foundArea || null);

    // Cargar usuarios
    const companyUsers = getUsersByCompany(currentCompany.id);
    const usersInArea = companyUsers.filter(user => user.areaId === areaId);
    const usersNotInArea = companyUsers.filter(user => !user.areaId || user.areaId !== areaId);
    
    setAreaUsers(usersInArea);
    setAvailableUsers(usersNotInArea);
  }, [currentCompany, areaId, getUsersByCompany]);

  const handleCreateUser = async () => {
    if (!userName || !userEmail || !userPassword || !currentCompany || !area) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      // Verificar si el email ya existe
      const usersRaw = localStorage.getItem('saas-platform-users');
      let allUsers: User[] = usersRaw ? JSON.parse(usersRaw) : [];
      
      const emailExists = allUsers.some(user => user.email.toLowerCase() === userEmail.toLowerCase());
      if (emailExists) {
        alert('Ya existe un usuario con este email');
        return;
      }

      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash(userPassword, 10);
      const newUser: User = {
        id: uuidv4(),
        email: userEmail.toLowerCase(),
        name: userName,
        password: hashedPassword,
        role: userRole,
        companyId: currentCompany.id,
        areaId: area.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: isUserActive
      };

      allUsers.push(newUser);
      localStorage.setItem('saas-platform-users', JSON.stringify(allUsers));
      
      // Actualizar listas
      const companyUsers = getUsersByCompany(currentCompany.id);
      const usersInArea = companyUsers.filter(user => user.areaId === areaId);
      const usersNotInArea = companyUsers.filter(user => !user.areaId || user.areaId !== areaId);
      
      setAreaUsers(usersInArea);
      setAvailableUsers(usersNotInArea);
      
      // Limpiar formulario
      setUserName('');
      setUserEmail('');
      setUserPassword('');
      setUserRole('user');
      setIsUserActive(true);
      setIsCreateUserOpen(false);
      
      alert(`Usuario creado exitosamente. Email: ${userEmail}, Contraseña: ${userPassword}`);
      
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignUser = () => {
    if (!selectedUserId || !currentCompany || !area) {
      alert('Por favor selecciona un usuario');
      return;
    }

    try {
      const usersRaw = localStorage.getItem('saas-platform-users');
      let allUsers: User[] = usersRaw ? JSON.parse(usersRaw) : [];
      
      // Actualizar el usuario para asignarlo al área
      allUsers = allUsers.map(user => {
        if (user.id === selectedUserId) {
          return {
            ...user,
            areaId: area.id,
            updatedAt: new Date()
          };
        }
        return user;
      });
      
      localStorage.setItem('saas-platform-users', JSON.stringify(allUsers));
      
      // Actualizar listas
      const companyUsers = getUsersByCompany(currentCompany.id);
      const usersInArea = companyUsers.filter(user => user.areaId === areaId);
      const usersNotInArea = companyUsers.filter(user => !user.areaId || user.areaId !== areaId);
      
      setAreaUsers(usersInArea);
      setAvailableUsers(usersNotInArea);
      
      setSelectedUserId('');
      setIsAssignUserOpen(false);
      
    } catch (error) {
      console.error('Error assigning user:', error);
      alert('Error al asignar el usuario');
    }
  };

  const handleRemoveUserFromArea = (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres quitar este usuario del área?')) return;

    try {
      const usersRaw = localStorage.getItem('saas-platform-users');
      let allUsers: User[] = usersRaw ? JSON.parse(usersRaw) : [];
      
      // Quitar el usuario del área
      allUsers = allUsers.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            areaId: undefined,
            updatedAt: new Date()
          };
        }
        return user;
      });
      
      localStorage.setItem('saas-platform-users', JSON.stringify(allUsers));
      
      // Actualizar listas
      const companyUsers = getUsersByCompany(currentCompany.id);
      const usersInArea = companyUsers.filter(user => user.areaId === areaId);
      const usersNotInArea = companyUsers.filter(user => !user.areaId || user.areaId !== areaId);
      
      setAreaUsers(usersInArea);
      setAvailableUsers(usersNotInArea);
      
    } catch (error) {
      console.error('Error removing user from area:', error);
      alert('Error al quitar el usuario del área');
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserPassword(password);
  };

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
            <Button variant="ghost" onClick={() => router.push(`/admin/areas/${areaId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Área
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Usuarios de {area.name}</h1>
              <p className="text-gray-600">
                Gestiona los usuarios asignados a esta área
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Crea un nuevo usuario y asígnalo directamente a {area.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Nombre del usuario"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="email@empresa.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña *</Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          placeholder="Contraseña"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateRandomPassword}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="role">Rol *</Label>
                    <Select value={userRole} onValueChange={(value: 'user' | 'operator') => setUserRole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="operator">Operador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={isUserActive}
                      onCheckedChange={setIsUserActive}
                    />
                    <Label htmlFor="active">Usuario activo</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateUser} disabled={isLoading}>
                      {isLoading ? 'Creando...' : 'Crear Usuario'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {availableUsers.length > 0 && (
              <Dialog open={isAssignUserOpen} onOpenChange={setIsAssignUserOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Asignar Usuario Existente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Asignar Usuario Existente</DialogTitle>
                    <DialogDescription>
                      Asigna un usuario existente de la empresa a {area.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="user">Usuario *</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar usuario" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.email}) - {user.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAssignUserOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAssignUser}>
                        Asignar Usuario
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios en el Área</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{areaUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Asignados a {area.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Disponibles</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Sin área asignada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {areaUsers.filter(user => user.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                De {areaUsers.length} total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usuarios del Área */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Usuarios Asignados</span>
            </CardTitle>
            <CardDescription>
              Lista de usuarios que pertenecen a {area.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {areaUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No hay usuarios asignados a esta área</p>
                <div className="flex justify-center space-x-3">
                  <Button onClick={() => setIsCreateUserOpen(true)}>
                    Crear nuevo usuario
                  </Button>
                  {availableUsers.length > 0 && (
                    <Button variant="outline" onClick={() => setIsAssignUserOpen(true)}>
                      Asignar usuario existente
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {areaUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{user.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {user.role === 'user' ? 'Usuario' : 
                             user.role === 'operator' ? 'Operador' : 
                             user.role === 'company_admin' ? 'Admin' : user.role}
                          </Badge>
                          <Badge 
                            variant={user.isActive ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveUserFromArea(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Quitar del Área
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usuarios Disponibles */}
        {availableUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Usuarios Disponibles</span>
              </CardTitle>
              <CardDescription>
                Usuarios de la empresa que no están asignados a ningún área
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {user.role === 'user' ? 'Usuario' : 
                           user.role === 'operator' ? 'Operador' : 
                           user.role === 'company_admin' ? 'Admin' : user.role}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        handleAssignUser();
                      }}
                    >
                      Asignar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}