'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plan } from '@/types';
import { seedPlansToLocalStorage } from '@/lib/init-data';
import { Users } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    seedPlansToLocalStorage();
    const plansRaw = localStorage.getItem('saas-platform-plans');
    if (plansRaw) {
      setPlans(JSON.parse(plansRaw));
    }
  }, []);


  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <header className="w-full flex flex-col items-center py-16 px-4 bg-card shadow-sm border-b">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center text-3xl font-bold shadow">A</div>
          <span className="text-3xl font-extrabold text-primary tracking-tight">Activitix</span>
        </div>
        <h1 className="text-5xl font-extrabold text-primary mb-4 text-center tracking-tight">Gestiona tu empresa, áreas y equipo en un solo lugar</h1>
        <p className="text-xl text-muted-foreground max-w-2xl text-center mb-8">
          Activitix es la plataforma SaaS que te permite administrar empresas, áreas, usuarios y actividades de forma ágil, segura y escalable. ¡Impulsa la productividad y el control en tu organización!
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">Multi-tenant</span>
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg border border-purple-700">
            <Users className="h-4 w-4" /> Gestión integral
          </span>
          <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">Planes flexibles</span>
          <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">Seguridad y soporte</span>
        </div>
        <div className="flex justify-center mb-8">
          <span className="text-base font-semibold text-purple-700 bg-purple-50 px-4 py-2 rounded shadow-sm border border-purple-200">
            Administra empresas, áreas, usuarios y actividades desde un solo lugar: <span className="font-bold text-blue-700">¡Gestión integral real!</span>
          </span>
        </div>
        <Button size="lg" className="mt-2 text-lg px-8 py-4 font-bold" onClick={() => router.push('/login')}>
          Comenzar ahora
        </Button>
      </header>

      {/* Planes Section */}
      <section className="flex flex-col items-center py-16 px-4">
        <h2 className="text-3xl font-bold text-primary mb-8">Nuestros Planes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {plans.map((plan) => (
            <Card key={plan.id} className="border shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary mb-1">{plan.name}</CardTitle>
                <CardDescription className="mb-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold mb-2 text-primary">
                  {plan.price === 0 ? "Gratis" : `$${plan.price} ${plan.currency}/mes`}
                </div>
                <ul className="mb-4 text-muted-foreground text-sm space-y-1">
                  <li>Usuarios: {plan.limits.users === 9999 ? "Ilimitados" : plan.limits.users}</li>
                  <li>Áreas: {plan.limits.areas === 9999 ? "Ilimitadas" : plan.limits.areas}</li>
                  <li>Actividades: {plan.limits.activities === 999999 ? "Ilimitadas" : plan.limits.activities}</li>
                  <li>Almacenamiento: {plan.limits.storageMb === 10000 ? "Ilimitado" : `${plan.limits.storageMb} MB`}</li>
                </ul>
                <Button variant="default" className="w-full" disabled>
                  Contratar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Beneficios Section */}
      <section className="flex flex-col items-center py-12 px-4 bg-card border-t">
        <h2 className="text-2xl font-bold text-primary mb-6">¿Por qué elegirnos?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="font-bold text-primary mb-1">Escalabilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Adapta la plataforma al crecimiento de tu empresa sin límites técnicos.</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/10">
            <CardHeader>
              <CardTitle className="font-bold text-secondary mb-1">Seguridad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tus datos y los de tus clientes siempre protegidos y bajo control.</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50">
            <CardHeader>
              <CardTitle className="font-bold text-purple-700 mb-1">Gestión integral</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Administra empresas, áreas, usuarios y actividades desde un solo lugar.</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50">
            <CardHeader>
              <CardTitle className="font-bold text-yellow-700 mb-1">Soporte dedicado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Equipo de soporte listo para ayudarte en todo momento.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 px-4 bg-card border-t text-muted-foreground flex flex-col items-center mt-auto">
        <p className="text-sm">&copy; {new Date().getFullYear()} Activitix. Todos los derechos reservados.</p>
        <div className="flex gap-4 mt-2">
          <a href="https://github.com/luisvasquezdelaguila/ssas-activity" target="_blank" rel="noopener noreferrer" className="underline text-primary">GitHub</a>
          <a href="mailto:soporte@activitix.com" className="underline text-primary">Contacto</a>
        </div>
      </footer>
    </div>
  );
}
