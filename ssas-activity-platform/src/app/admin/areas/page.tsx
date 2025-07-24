"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuthStore } from "@/stores/auth-store";
import { v4 as uuidv4 } from "uuid";
import { Area } from "@/types";

export default function AreasPage() {
  const router = useRouter();
  const { currentUser, currentCompany } = useAuthStore();
  const [areas, setAreas] = useState<Area[]>([]);
  const [name, setName] = useState("");
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar áreas de la empresa
  useEffect(() => {
    if (!currentCompany) return;
    const areasRaw = localStorage.getItem("saas-platform-areas");
    let allAreas: Area[] = areasRaw ? JSON.parse(areasRaw) : [];
    setAreas(allAreas.filter((a) => a.companyId === currentCompany.id));
  }, [currentCompany]);

  // If editing, populate description and isActive
  useEffect(() => {
    if (editingArea) {
      setDescription(editingArea.description || "");
      setIsActive(editingArea.isActive !== false);
    } else {
      setDescription("");
      setIsActive(true);
    }
  }, [editingArea]);

  const handleSave = () => {
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!currentCompany) return;
    const areasRaw = localStorage.getItem("saas-platform-areas");
    let allAreas: Area[] = areasRaw ? JSON.parse(areasRaw) : [];
    if (editingArea) {
      // Editar
      allAreas = allAreas.map((a) =>
        a.id === editingArea.id
          ? {
              ...a,
              name,
              description,
              isActive,
              updatedAt: new Date(),
            }
          : a
      );
    } else {
      // Crear
      const exists = allAreas.some(
        (a) => a.companyId === currentCompany.id && a.name.toLowerCase() === name.trim().toLowerCase()
      );
      if (exists) {
        setError("Ya existe un área con ese nombre");
        return;
      }
      allAreas.push({
        id: uuidv4(),
        name: name.trim(),
        description: description.trim(),
        isActive,
        companyId: currentCompany.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    localStorage.setItem("saas-platform-areas", JSON.stringify(allAreas));
    setAreas(allAreas.filter((a) => a.companyId === currentCompany.id));
    setName("");
    setDescription("");
    setIsActive(true);
    setEditingArea(null);
    setError(null);
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setName(area.name);
    setError(null);
  };

  const handleDelete = (area: Area) => {
    if (!confirm("¿Seguro que deseas eliminar el área?")) return;
    const areasRaw = localStorage.getItem("saas-platform-areas");
    let allAreas: Area[] = areasRaw ? JSON.parse(areasRaw) : [];
    allAreas = allAreas.filter((a) => a.id !== area.id);
    localStorage.setItem("saas-platform-areas", JSON.stringify(allAreas));
    setAreas(allAreas.filter((a) => a.companyId === currentCompany?.id));
    setName("");
    setEditingArea(null);
    setError(null);
  };

  if (!currentUser || !currentCompany) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Áreas de la Empresa</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{editingArea ? "Editar Área" : "Nueva Área"}</CardTitle>
            <CardDescription>
              {editingArea
                ? "Modifica el nombre del área."
                : "Agrega una nueva área para la empresa."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="areaName">Nombre del Área</Label>
                <Input
                  id="areaName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Finanzas, Operaciones, Colaboradores"
                />
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
              </div>
              <div>
                <Label htmlFor="areaDescription">Descripción</Label>
                <Input
                  id="areaDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción del área (opcional)"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="areaActive" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="areaActive">Área activa</Label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave}>{editingArea ? "Guardar Cambios" : "Agregar Área"}</Button>
                {editingArea && (
                  <Button variant="outline" onClick={() => { setEditingArea(null); setName(""); setError(null); }}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Áreas Registradas</CardTitle>
            <CardDescription>Lista de áreas de la empresa</CardDescription>
          </CardHeader>
          <CardContent>
            {areas.length === 0 ? (
              <p className="text-gray-500">No hay áreas registradas.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {areas.map((area) => (
                  <li key={area.id} className="flex items-center justify-between py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{area.name}</span>
                      {area.description && (
                        <span className="text-xs text-gray-500">{area.description}</span>
                      )}
                      <span className={`text-xs mt-1 ${area.isActive === false ? 'text-red-500' : 'text-green-600'}`}>{area.isActive === false ? 'Inactiva' : 'Activa'}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(area)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(area)}>
                        Eliminar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
