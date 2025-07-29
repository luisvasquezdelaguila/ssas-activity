// src/shared/seeders/activity-seeder.enhanced.ts

import { BaseSeeder } from './base-seeder';
import ActivityModel from '../../infrastructure/db/activity.model';
import UserModel from '../../infrastructure/db/user.model';
import CompanyModel from '../../infrastructure/db/company.model';

export class ActivitySeeder extends BaseSeeder {
  async run(): Promise<void> {
    await this.connectDB();
    
    // Obtener usuarios con populate de company
    const users = await UserModel.find({ 
      role: { $in: ['user', 'operator', 'company_admin'] } 
    }).populate('companyId');
    
    if (users.length === 0) {
      this.log('No users found. Run user seeder first.');
      return;
    }

    // Obtener compañías para validar referencias
    const companies = await CompanyModel.find();
    if (companies.length === 0) {
      this.log('No companies found. Run company seeder first.');
      return;
    }

    // Crear actividades más realistas por compañía
    const activitiesByCompany = await this.createActivitiesForEachCompany(users, companies);

    for (const activity of activitiesByCompany) {
      const existing = await ActivityModel.findOne({ title: activity.title });
      if (!existing) {
        const createdActivity = await ActivityModel.create(activity);
        this.log(`Created activity: ${activity.title} (${activity.status}) - Company: ${activity.companyId}`);
      }
    }

    // Mostrar estadísticas con populate
    await this.showStatistics();
  }

  private async createActivitiesForEachCompany(users: any[], companies: any[]) {
    const activities = [];

    for (const company of companies) {
      // Filtrar usuarios de esta compañía
      const companyUsers = users.filter(user => 
        user.companyId && user.companyId.toString() === company._id.toString()
      );

      if (companyUsers.length === 0) continue;

      // Admin de la compañía (creador de actividades)
      const admin = companyUsers.find(u => u.role === 'company_admin') || companyUsers[0];
      
      // Usuarios regulares y operadores (asignados a actividades)
      const assignableUsers = companyUsers.filter(u => ['user', 'operator'].includes(u.role));

      // Crear actividades específicas por tipo de compañía
      const companyActivities = this.getActivitiesForCompanyType(
        company, 
        admin, 
        assignableUsers
      );

      activities.push(...companyActivities);
    }

    return activities;
  }

  private getActivitiesForCompanyType(company: any, admin: any, assignableUsers: any[]) {
    const now = new Date();
    const activities = [];

    // Actividades base para todas las compañías
    const baseActivities = [
      {
        title: `Reunión de planificación semanal - ${company.name}`,
        description: `Planificación semanal de tareas y objetivos para ${company.name}`,
        assignedTo: assignableUsers[0]?._id || admin._id,
        createdBy: admin._id,
        status: 'pending',
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Mañana
        companyId: company._id,
        statusHistory: [{
          status: 'pending',
          changedBy: admin._id,
          changedAt: now,
          assignedTo: assignableUsers[0]?._id || admin._id
        }]
      },
      {
        title: `Revisión de procesos - ${company.name}`,
        description: `Revisar y optimizar procesos internos de ${company.name}`,
        assignedTo: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id,
        createdBy: admin._id,
        status: 'in_progress',
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Hace 2 horas
        companyId: company._id,
        statusHistory: [
          {
            status: 'pending',
            changedBy: admin._id,
            changedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            assignedTo: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id
          },
          {
            status: 'in_progress',
            changedBy: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id,
            changedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            assignedTo: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id,
            startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000)
          }
        ]
      }
    ];

    // Actividades específicas según el tipo de compañía
    if (company.name.toLowerCase().includes('tech')) {
      activities.push(...this.getTechCompanyActivities(company, admin, assignableUsers));
    } else if (company.name.toLowerCase().includes('marketing')) {
      activities.push(...this.getMarketingCompanyActivities(company, admin, assignableUsers));
    } else if (company.name.toLowerCase().includes('design')) {
      activities.push(...this.getDesignCompanyActivities(company, admin, assignableUsers));
    }

    return [...baseActivities, ...activities];
  }

  private getTechCompanyActivities(company: any, admin: any, assignableUsers: any[]) {
    const now = new Date();
    return [
      {
        title: `Desarrollo de API REST - ${company.name}`,
        description: 'Implementar endpoints para gestión de usuarios y autenticación',
        assignedTo: assignableUsers[0]?._id || admin._id,
        createdBy: admin._id,
        status: 'completed',
        startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Hace 5 días
        endTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
        companyId: company._id,
        statusHistory: [
          {
            status: 'pending',
            changedBy: admin._id,
            changedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            assignedTo: assignableUsers[0]?._id || admin._id
          },
          {
            status: 'in_progress',
            changedBy: assignableUsers[0]?._id || admin._id,
            changedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            assignedTo: assignableUsers[0]?._id || admin._id,
            startTime: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
          },
          {
            status: 'completed',
            changedBy: assignableUsers[0]?._id || admin._id,
            changedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            assignedTo: assignableUsers[0]?._id || admin._id,
            startTime: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            endTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        title: `Testing automatizado - ${company.name}`,
        description: 'Implementar tests unitarios y de integración',
        assignedTo: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id,
        createdBy: admin._id,
        status: 'pending',
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // En 2 días
        companyId: company._id,
        statusHistory: [{
          status: 'pending',
          changedBy: admin._id,
          changedAt: now,
          assignedTo: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id
        }]
      }
    ];
  }

  private getMarketingCompanyActivities(company: any, admin: any, assignableUsers: any[]) {
    const now = new Date();
    return [
      {
        title: `Campaña redes sociales - ${company.name}`,
        description: 'Crear contenido para campaña de marketing en redes sociales',
        assignedTo: assignableUsers[0]?._id || admin._id,
        createdBy: admin._id,
        status: 'in_progress',
        startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Ayer
        companyId: company._id,
        statusHistory: [
          {
            status: 'pending',
            changedBy: admin._id,
            changedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            assignedTo: assignableUsers[0]?._id || admin._id
          },
          {
            status: 'in_progress',
            changedBy: assignableUsers[0]?._id || admin._id,
            changedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            assignedTo: assignableUsers[0]?._id || admin._id,
            startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        title: `Análisis de métricas - ${company.name}`,
        description: 'Analizar métricas de rendimiento de campañas anteriores',
        assignedTo: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id,
        createdBy: admin._id,
        status: 'completed',
        startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        companyId: company._id,
        statusHistory: [
          {
            status: 'pending',
            changedBy: admin._id,
            changedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            assignedTo: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id
          },
          {
            status: 'completed',
            changedBy: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id,
            changedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            assignedTo: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id,
            startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            endTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    ];
  }

  private getDesignCompanyActivities(company: any, admin: any, assignableUsers: any[]) {
    const now = new Date();
    return [
      {
        title: `Diseño de interfaz - ${company.name}`,
        description: 'Crear mockups y prototipos para nueva aplicación móvil',
        assignedTo: assignableUsers[0]?._id || admin._id,
        createdBy: admin._id,
        status: 'pending',
        startTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Mañana
        companyId: company._id,
        statusHistory: [{
          status: 'pending',
          changedBy: admin._id,
          changedAt: now,
          assignedTo: assignableUsers[0]?._id || admin._id
        }]
      },
      {
        title: `Revisión de brand guidelines - ${company.name}`,
        description: 'Actualizar guías de marca y estilo visual',
        assignedTo: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id,
        createdBy: admin._id,
        status: 'cancelled',
        companyId: company._id,
        statusHistory: [
          {
            status: 'pending',
            changedBy: admin._id,
            changedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            assignedTo: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id
          },
          {
            status: 'cancelled',
            changedBy: admin._id,
            changedAt: now,
            assignedTo: assignableUsers[1]?._id || assignableUsers[0]?._id || admin._id
          }
        ]
      }
    ];
  }

  private async showStatistics() {
    // Obtener estadísticas con populate
    const totalActivities = await ActivityModel.countDocuments();
    
    const activitiesByStatus = await ActivityModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const activitiesByCompany = await ActivityModel.aggregate([
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      { $group: { _id: '$company.name', count: { $sum: 1 } } }
    ]);

    this.log(`\n📊 Activity Statistics:`);
    this.log(`   Total activities: ${totalActivities}`);
    this.log(`   By status:`);
    activitiesByStatus.forEach(stat => {
      this.log(`     ${stat._id}: ${stat.count}`);
    });
    this.log(`   By company:`);
    activitiesByCompany.forEach(stat => {
      this.log(`     ${stat._id}: ${stat.count}`);
    });
  }

  async clear(): Promise<void> {
    await this.connectDB();
    await ActivityModel.deleteMany({});
    this.log('Cleared all activities');
  }
}
