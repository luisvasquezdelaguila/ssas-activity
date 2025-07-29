"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Area, Company } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getFromLocalStorage, setToLocalStorage } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ArrowLeft } from "lucide-react";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    areaId: "",
    isActive: true,
  });

  useEffect(() => {
    const data = getFromLocalStorage();
    // Si no hay usuarios, intentar recargar desde localStorage (por si el storage estaba vacío)
    if (!data.users || data.users.length === 0) {
      setUser(null);
      setCompanies([]);
      setAreas([]);
      return;
    }
    const foundUser = data.users.find((u: User) => u.id === userId);
    setUser(foundUser || null);
    setCompanies(data.companies);
    if (foundUser) {
      setForm({
        name: foundUser.name,
        email: foundUser.email,
        password: "",
        phone: foundUser.phone || "",
        role: foundUser.role,
        areaId: foundUser.areaId || "",
        isActive: foundUser.isActive,
      });
      setAreas(
        data.areas?.filter((a: Area) => a.companyId === foundUser.companyId) || []
      );
    }
  }, [userId]);

  if (!user) {
    return (
      <div className="p-4 text-red-600">
        Usuario no encontrado.<br />
        {`ID buscado: ${userId}`}<br />
        {`Usuarios cargados: `}
        <pre className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto">
          {JSON.stringify(getFromLocalStorage().users, null, 2)}
        </pre>
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((f) => ({ ...f, [name]: checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function handleSwitchChange(checked: boolean) {
    setForm((f) => ({ ...f, isActive: checked }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = getFromLocalStorage();
    const updatedUsers = data.users.map((u: User) => {
      if (u.id !== userId) return u;
      const updated = {
        ...u,
        ...form,
        role: form.role as User["role"],
        updatedAt: new Date(),
      };
      // Solo actualizar password si se ingresó un valor
      if (!form.password) delete (updated as any).password;
      return updated;
    });
    setToLocalStorage({ ...data, users: updatedUsers });
    router.push("/admin/users");
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/users')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Usuario
            </h1>
            <p className="text-gray-600">
              Modifica la información de {form.name}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de edición */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Información del Usuario</span>
                </CardTitle>
                <CardDescription>
                  Actualiza los datos básicos del usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" value={form.email} onChange={handleChange} required disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono (incluye código de país)</Label>
                      <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Ej: +52 1234567890" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña (dejar vacío para no cambiar)</Label>
                      <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol</Label>
                      <select id="role" name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-2 py-1">
                        <option value="user">Usuario</option>
                        <option value="operator">Operador</option>
                        <option value="company_admin">Administrador</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="areaId">Área</Label>
                      <select id="areaId" name="areaId" value={form.areaId} onChange={handleChange} className="w-full border rounded px-2 py-1">
                        <option value="">Colaboradores</option>
                        {areas.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="isActive" checked={form.isActive} onCheckedChange={handleSwitchChange} />
                    <Label htmlFor="isActive">Usuario activo</Label>
                  </div>
                  {/* Mensaje de error si lo necesitas aquí */}
                  <div className="flex justify-end space-x-3">
                    <Button type="submit">Guardar Cambios</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          {/* Información adicional (puedes agregar más tarjetas aquí si lo deseas) */}
        </div>
      </div>
    </DashboardLayout>
  );
}
