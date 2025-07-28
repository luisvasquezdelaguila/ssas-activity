// src/shared/seeders/activity-seeder.ts

import { BaseSeeder } from './base-seeder';
import ActivityModel from '../../infrastructure/db/activity.model';
import UserModel from '../../infrastructure/db/user.model';

export class ActivitySeeder extends BaseSeeder {
  async run(): Promise<void> {
    await this.connectDB();
    
    const users = await UserModel.find({ role: { $in: ['user', 'operator'] } });
    if (users.length === 0) {
      this.log('No users found. Run user seeder first.');
      return;
    }

    const activities = [
      {
        title: 'Desarrollo de componente Login',
        description: 'Implementar el componente de autenticación con validaciones',
        assignedTo: users[0]._id,
        createdBy: users[0]._id,
        status: 'pending',
        priority: 'high',
        estimatedHours: 8,
        startTime: new Date('2025-01-15T09:00:00Z'),
        endTime: new Date('2025-01-15T17:00:00Z'),
        companyId: (users[0] as any).companyId,
        statusHistory: [{
          status: 'pending',
          changedBy: users[0]._id,
          changedAt: new Date(),
          comment: 'Actividad creada'
        }]
      },
      {
        title: 'Testing de API de usuarios',
        description: 'Realizar pruebas unitarias y de integración para endpoints de usuarios',
        assignedTo: users[1]._id,
        createdBy: users[0]._id,
        status: 'in_progress',
        priority: 'medium',
        estimatedHours: 6,
        startTime: new Date('2025-01-16T10:00:00Z'),
        endTime: new Date('2025-01-16T16:00:00Z'),
        companyId: (users[1] as any).companyId,
        statusHistory: [
          {
            status: 'pending',
            changedBy: users[0]._id,
            changedAt: new Date(Date.now() - 86400000), // 1 día atrás
            comment: 'Actividad creada'
          },
          {
            status: 'in_progress',
            changedBy: users[1]._id,
            changedAt: new Date(),
            comment: 'Iniciando testing'
          }
        ]
      },
      {
        title: 'Revisión de código Frontend',
        description: 'Code review de los componentes desarrollados la semana pasada',
        assignedTo: users[0]._id,
        createdBy: users[1]._id,
        status: 'completed',
        priority: 'low',
        estimatedHours: 2,
        startTime: new Date('2025-01-14T14:00:00Z'),
        endTime: new Date('2025-01-14T16:00:00Z'),
        companyId: (users[0] as any).companyId,
        statusHistory: [
          {
            status: 'pending',
            changedBy: users[1]._id,
            changedAt: new Date(Date.now() - 172800000), // 2 días atrás
            comment: 'Actividad creada'
          },
          {
            status: 'in_progress',
            changedBy: users[0]._id,
            changedAt: new Date(Date.now() - 86400000), // 1 día atrás
            comment: 'Iniciando revisión'
          },
          {
            status: 'completed',
            changedBy: users[0]._id,
            changedAt: new Date(),
            comment: 'Revisión completada'
          }
        ]
      },
      {
        title: 'Configuración de CI/CD',
        description: 'Configurar pipeline de integración continua con GitHub Actions',
        assignedTo: users[2] || users[0]._id,
        createdBy: users[0]._id,
        status: 'cancelled',
        priority: 'high',
        estimatedHours: 12,
        startTime: new Date('2025-01-17T08:00:00Z'),
        endTime: new Date('2025-01-18T17:00:00Z'),
        companyId: (users[2] || users[0] as any).companyId,
        statusHistory: [
          {
            status: 'pending',
            changedBy: users[0]._id,
            changedAt: new Date(Date.now() - 172800000), // 2 días atrás
            comment: 'Actividad creada'
          },
          {
            status: 'cancelled',
            changedBy: users[2] ? users[2]._id : users[0]._id,
            changedAt: new Date(),
            comment: 'Bloqueado esperando accesos al servidor'
          }
        ]
      },
    ];

    for (const activity of activities) {
      const existing = await ActivityModel.findOne({ title: activity.title });
      if (!existing) {
        await ActivityModel.create(activity);
        this.log(`Created activity: ${activity.title} (${activity.status})`);
      }
    }
  }

  async clear(): Promise<void> {
    await this.connectDB();
    await ActivityModel.deleteMany({});
    this.log('Cleared all activities');
  }
}
