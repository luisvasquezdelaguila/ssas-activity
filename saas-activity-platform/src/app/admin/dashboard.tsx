"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuthStore } from "@/stores/auth-store";
import { Area } from "@/types";

export default function AdminDashboard() {
  const { currentUser, currentCompany } = useAuthStore();
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    if (!currentCompany) return;
    const areasRaw = localStorage.getItem("saas-platform-areas");
    let allAreas: Area[] = areasRaw ? JSON.parse(areasRaw) : [];
    setAreas(allAreas.filter((a) => a.companyId === currentCompany.id));
  }, [currentCompany]);

  if (!currentUser || !currentCompany) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard de Administración</h1>
        <Card>
          <CardHeader>
            <CardTitle>Áreas de la Empresa</CardTitle>
            <CardDescription>Resumen de áreas registradas</CardDescription>
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
