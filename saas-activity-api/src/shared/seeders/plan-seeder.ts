// src/shared/seeders/plan-seeder.ts

import { BaseSeeder } from './base-seeder';
import PlanModel from '../../infrastructure/db/plan.model';

export class PlanSeeder extends BaseSeeder {
  async run(): Promise<void> {
    await this.connectDB();
    
    const plans = [
      {
        name: 'Básico',
        description: 'Plan básico para empresas pequeñas',
        price: 29.99,
        maxUsers: 10,
        maxProjects: 5,
        features: [
          'Gestión básica de actividades',
          'Calendario simple',
          'Reportes básicos',
          'Soporte por email'
        ],
        isActive: true,
      },
      {
        name: 'Profesional',
        description: 'Plan profesional para empresas medianas',
        price: 79.99,
        maxUsers: 50,
        maxProjects: 25,
        features: [
          'Gestión avanzada de actividades',
          'Calendario con vistas múltiples',
          'Reportes avanzados',
          'Integraciones',
          'Soporte prioritario',
          'API access'
        ],
        isActive: true,
      },
      {
        name: 'Empresarial',
        description: 'Plan empresarial para grandes organizaciones',
        price: 199.99,
        maxUsers: -1, // Ilimitado
        maxProjects: -1, // Ilimitado
        features: [
          'Todas las funcionalidades',
          'Usuarios ilimitados',
          'Proyectos ilimitados',
          'Dashboard personalizado',
          'Integraciones avanzadas',
          'Soporte 24/7',
          'SLA garantizado',
          'Onboarding personalizado'
        ],
        isActive: true,
      },
    ];

    for (const plan of plans) {
      const existing = await PlanModel.findOne({ name: plan.name });
      if (!existing) {
        await PlanModel.create(plan);
        this.log(`Created plan: ${plan.name} ($${plan.price})`);
      }
    }
  }

  async clear(): Promise<void> {
    await this.connectDB();
    await PlanModel.deleteMany({});
    this.log('Cleared all plans');
  }
}
