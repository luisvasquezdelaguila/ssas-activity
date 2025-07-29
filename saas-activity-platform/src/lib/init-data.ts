// Seed de planes SaaS
export const defaultPlans = [
  {
    id: 'plan-basic',
    name: 'Básico',
    description: 'Ideal para equipos pequeños. Hasta 5 usuarios y 2 áreas.',
    price: 0,
    currency: 'USD',
    limits: { users: 5, areas: 2, activities: 100, storageMb: 100 },
    isActive: true,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    description: 'Para empresas en crecimiento. Hasta 20 usuarios y 10 áreas.',
    price: 29,
    currency: 'USD',
    limits: { users: 20, areas: 10, activities: 1000, storageMb: 1000 },
    isActive: true,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    description: 'Sin límites. Soporte y personalización avanzada.',
    price: 99,
    currency: 'USD',
    limits: { users: 9999, areas: 9999, activities: 999999, storageMb: 10000 },
    isActive: true,
  },
];

export function seedPlansToLocalStorage() {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('saas-platform-plans')) {
      localStorage.setItem('saas-platform-plans', JSON.stringify(defaultPlans));
    }
  }
}
import { User, Company } from '@/types';
import { Area } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { toast } from 'sonner';

export async function initializeDefaultData() {
  try {
    // Inicializar planes si no existen
    if (!localStorage.getItem('saas-platform-plans')) {
      localStorage.setItem('saas-platform-plans', JSON.stringify(defaultPlans));
    }

    // Verificar si ya existen datos
    const existingUsers = localStorage.getItem('saas-platform-users');
    const existingCompanies = localStorage.getItem('saas-platform-companies');
    const existingActivities = localStorage.getItem('saas-platform-activities');

    // Crear usuario super admin por defecto si no existe
    if (!existingUsers) {
      // Hashear contraseña por defecto
      const hashedPassword = await bcrypt.hash('password123', 10);
      const superAdmin: User = {
        id: uuidv4(),
        email: 'admin@platform.com',
        name: 'Super Administrador',
        password: hashedPassword,
        role: 'super_admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      localStorage.setItem('saas-platform-users', JSON.stringify([superAdmin]));
    }

    // Inicializar arrays vacíos si no existen
    if (!existingCompanies) {
      localStorage.setItem('saas-platform-companies', JSON.stringify([]));
    }

    if (!existingActivities) {
      localStorage.setItem('saas-platform-activities', JSON.stringify([]));
    }

    // Crear datos de ejemplo si no existen empresas demo
    const companies = JSON.parse(localStorage.getItem('saas-platform-companies') || '[]');
    const demoExists = companies.some((c: Company) => c.domain === 'demo.com');
    if (!demoExists) {
      await createSampleData();
    }
  } catch (error: any) {
    toast(
      'Error al inicializar datos',
      {
        description: error?.message || 'Ocurrió un error inesperado.'
      }
    );
  }
}

export async function createSampleData() {
  try {
    // Crear empresa de ejemplo
    const sampleCompany: Company = {
      id: uuidv4(),
      name: 'Empresa Demo',
      domain: 'demo.com',
      planId: 'plan-basic',
      settings: {
        timezone: 'America/Mexico_City',
        workingHours: {
          start: '09:00',
          end: '18:00',
        },
        allowUserSelfRegistration: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    // Crear área por defecto "Colaboradores"
    const colaboradoresArea: Area = {
      id: uuidv4(),
      name: 'Colaboradores',
      description: 'Área por defecto para todos los colaboradores',
      companyId: sampleCompany.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    // Hashear contraseñas para usuarios de ejemplo
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Crear usuarios de ejemplo
    const sampleUsers: User[] = [
    {
      id: uuidv4(),
      email: 'admin@demo.com',
      name: 'Admin Demo',
      password: hashedPassword,
      role: 'company_admin',
      companyId: sampleCompany.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    },
    {
      id: uuidv4(),
      email: 'operador@demo.com',
      name: 'Operador Demo',
      password: hashedPassword,
      role: 'operator',
      companyId: sampleCompany.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    },
    {
      id: uuidv4(),
      email: 'usuario@demo.com',
      name: 'Usuario Demo',
      password: hashedPassword,
      role: 'user',
      companyId: sampleCompany.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    },
  ];

    // Crear actividades de ejemplo
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sampleActivities = [
    {
      id: uuidv4(),
      title: 'Reunión de equipo',
      description: 'Reunión semanal del equipo de desarrollo',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      userId: sampleUsers[2].id, // Usuario Demo
      companyId: sampleCompany.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      title: 'Revisión de proyecto',
      description: 'Revisión del progreso del proyecto actual',
      startDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0),
      endDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 30),
      userId: sampleUsers[2].id, // Usuario Demo
      companyId: sampleCompany.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      title: 'Capacitación',
      description: 'Sesión de capacitación sobre nuevas herramientas',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 9, 0),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 12, 0),
      userId: sampleUsers[1].id, // Operador Demo
      companyId: sampleCompany.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

    // Guardar datos de ejemplo
    const existingUsers = JSON.parse(localStorage.getItem('saas-platform-users') || '[]');
    const existingCompanies = JSON.parse(localStorage.getItem('saas-platform-companies') || '[]');
    const existingActivities = JSON.parse(localStorage.getItem('saas-platform-activities') || '[]');
    const existingAreas = JSON.parse(localStorage.getItem('saas-platform-areas') || '[]');

    // Solo agregar si no existen ya
    const companyExists = existingCompanies.some((c: Company) => c.domain === 'demo.com');
    if (!companyExists) {
      existingCompanies.push(sampleCompany);
      localStorage.setItem('saas-platform-companies', JSON.stringify(existingCompanies));

      // Agregar área por defecto
      existingAreas.push(colaboradoresArea);
      localStorage.setItem('saas-platform-areas', JSON.stringify(existingAreas));

      // Agregar usuarios de ejemplo
      existingUsers.push(...sampleUsers);
      localStorage.setItem('saas-platform-users', JSON.stringify(existingUsers));

      // Agregar actividades de ejemplo (serializadas)
      const serializedActivities = sampleActivities.map(activity => ({
        ...activity,
        startDate: activity.startDate.toISOString(),
        endDate: activity.endDate.toISOString(),
        createdAt: activity.createdAt.toISOString(),
        updatedAt: activity.updatedAt.toISOString(),
      }));
      
      existingActivities.push(...serializedActivities);
      localStorage.setItem('saas-platform-activities', JSON.stringify(existingActivities));
    }
  } catch (error: any) {
    toast(
      'Error al crear datos de ejemplo',
      {
        description: error?.message || 'Ocurrió un error inesperado.'
      }
    );
  }
}

export function resetData() {
  localStorage.removeItem('saas-platform-users');
  localStorage.removeItem('saas-platform-companies');
  localStorage.removeItem('saas-platform-activities');
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('company-storage');
  localStorage.removeItem('user-storage');
  localStorage.removeItem('activity-storage');
  
  // Reinicializar datos por defecto
  initializeDefaultData();
}