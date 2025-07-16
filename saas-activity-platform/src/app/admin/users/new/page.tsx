"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getFromLocalStorage, setToLocalStorage } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function CreateUserPage() {
  const router = useRouter();
  const [areas, setAreas] = useState(() => {
    const data = getFromLocalStorage();
    return data.areas || [];
  });
  const [companies, setCompanies] = useState(() => {
    const data = getFromLocalStorage();
    return data.companies || [];
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    areaId: "",
    companyId: companies[0]?.id || "",
    isActive: true,
  });
  const [error, setError] = useState("");

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
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Nombre, email y contraseña son obligatorios");
      return;
    }
    const data = getFromLocalStorage();
    // Validar email único
    if (data.users.some((u: any) => u.email === form.email)) {
      setError("Ya existe un usuario con ese email");
      return;
    }
    const newUser = {
      id: uuidv4(),
      name: form.name,
      email: form.email,
      password: form.password, // En producción, hashear
      role: form.role as any, // UserRole
      areaId: form.areaId || undefined,
      companyId: form.companyId || undefined,
      isActive: form.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setToLocalStorage({ ...data, users: [...data.users, newUser] });
    router.push("/admin/users");
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Usuario</h1>
            <p className="text-gray-600">Agrega un nuevo usuario al sistema</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Información del Usuario</span>
                </CardTitle>
                <CardDescription>Completa los datos para crear el usuario</CardDescription>
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
                      <Input id="email" name="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
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
                      <Label htmlFor="companyId">Empresa</Label>
                      <select id="companyId" name="companyId" value={form.companyId} onChange={handleChange} className="w-full border rounded px-2 py-1">
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="areaId">Área</Label>
                      <select id="areaId" name="areaId" value={form.areaId} onChange={handleChange} className="w-full border rounded px-2 py-1">
                        <option value="">Colaboradores</option>
                        {areas.map((a: any) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="isActive" checked={form.isActive} onCheckedChange={handleSwitchChange} />
                    <Label htmlFor="isActive">Usuario activo</Label>
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <div className="flex justify-end space-x-3">
                    <Button type="submit">Crear Usuario</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
