"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Select } from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { defaultPlans } from "@/lib/init-data";
import { ArrowLeft } from "lucide-react";

export default function NewCompanyPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [domain, setDomain] = useState("");
    const [email, setEmail] = useState("");
    const [planId, setPlanId] = useState("");
    const [adminName, setAdminName] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [plans, setPlans] = useState<typeof defaultPlans>([]);

    useEffect(() => {
        const plansRaw = localStorage.getItem("saas-platform-plans");
        if (plansRaw) {
            setPlans(JSON.parse(plansRaw));
        } else {
            setPlans(defaultPlans);
        }
    }, []);

    const handleCreate = () => {
        if (!name || !domain || !email || !planId || !adminName || !adminPassword) {
            toast.error("Completa todos los campos");
            return;
        }
        // Guardar empresa en localStorage
        const companiesRaw = localStorage.getItem("saas-platform-companies");
        const companies = companiesRaw ? JSON.parse(companiesRaw) : [];
        const companyId = Date.now().toString();
        const newCompany = {
            id: companyId,
            name,
            domain,
            email,
            planId,
            createdAt: new Date().toISOString(),
            isActive,
        };
        companies.push(newCompany);
        localStorage.setItem("saas-platform-companies", JSON.stringify(companies));

        // Crear usuario administrador de la empresa
        const usersRaw = localStorage.getItem("saas-platform-users");
        const users = usersRaw ? JSON.parse(usersRaw) : [];
        const newAdminUser = {
            id: `${companyId}-admin`,
            name: adminName,
            email: email,
            password: adminPassword,
            role: 'company_admin',
            companyId: companyId,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        users.push(newAdminUser);
        localStorage.setItem("saas-platform-users", JSON.stringify(users));

        toast.success("Empresa y usuario administrador creados correctamente");
        router.push("/super-admin");
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/super-admin')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nueva Empresa</h1>
                        <p className="text-gray-600">Registra una nueva empresa en la plataforma</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulario principal */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <span>Información de la Empresa</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleCreate(); }}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre de la Empresa</Label>
                                            <Input id="name" placeholder="Ej: Mi Empresa S.A." value={name} onChange={e => setName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="domain">Dominio</Label>
                                            <Input id="domain" placeholder="ejemplo.com" value={domain} onChange={e => setDomain(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email de contacto</Label>
                                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="empresa@email.com" />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 py-2">
                                        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                                        <Label htmlFor="isActive">Empresa activa</Label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="adminName">Nombre del Administrador</Label>
                                            <Input id="adminName" placeholder="Ej: Juan Pérez" value={adminName} onChange={e => setAdminName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="adminPassword">Contraseña del Administrador</Label>
                                            <Input id="adminPassword" type="password" placeholder="••••••••" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="plan">Plan asignado</Label>
                                        <select id="plan" className="w-full border rounded px-3 py-2" value={planId} onChange={e => setPlanId(e.target.value)}>
                                            <option value="">Selecciona un plan</option>
                                            {plans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name} - {plan.price === 0 ? "Gratis" : `$${plan.price} ${plan.currency}/mes`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <Button type="button" variant="outline" onClick={() => router.push('/super-admin')}>Cancelar</Button>
                                        <Button type="submit">Crear Empresa</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Sección lateral de ayuda */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>¿Por qué registrar una empresa?</CardTitle>
                                <CardDescription>La empresa será el núcleo de gestión y usuarios en la plataforma.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-4 text-sm text-gray-600 space-y-2">
                                    <li>Podrás asignar un plan SaaS y configurar horarios.</li>
                                    <li>El administrador inicial recibirá acceso inmediato.</li>
                                    <li>La zona horaria y auto-registro facilitan la operación global.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
