// src/shared/seeders/area-seeder.ts

import { BaseSeeder } from './base-seeder';
import AreaModel from '../../infrastructure/db/area.model';
import CompanyModel from '../../infrastructure/db/company.model';

export class AreaSeeder extends BaseSeeder {
  async run(): Promise<void> {
    await this.connectDB();
    
    const companies = await CompanyModel.find();
    if (companies.length === 0) {
      this.log('No companies found. Run company seeder first.');
      return;
    }

    const areas = [
      // TechCorp Solutions areas
      {
        name: 'Desarrollo Frontend',
        description: 'Equipo encargado del desarrollo de interfaces de usuario',
        companyId: companies[0]._id,
        isActive: true,
      },
      {
        name: 'Desarrollo Backend',
        description: 'Equipo encargado del desarrollo de APIs y servicios',
        companyId: companies[0]._id,
        isActive: true,
      },
      {
        name: 'QA Testing',
        description: 'Equipo de control de calidad y testing',
        companyId: companies[0]._id,
        isActive: true,
      },
      {
        name: 'DevOps',
        description: 'Equipo de infraestructura y deployment',
        companyId: companies[0]._id,
        isActive: true,
      },
      // Global Marketing Inc areas
      {
        name: 'Marketing Digital',
        description: 'Equipo de estrategias digitales y publicidad online',
        companyId: companies[1]._id,
        isActive: true,
      },
      {
        name: 'Diseño Gráfico',
        description: 'Equipo de diseño visual y branding',
        companyId: companies[1]._id,
        isActive: true,
      },
      {
        name: 'Social Media',
        description: 'Gestión de redes sociales y community management',
        companyId: companies[1]._id,
        isActive: true,
      },
      // CreativeDesign Studio areas
      {
        name: 'UX/UI Design',
        description: 'Experiencia de usuario e interfaces',
        companyId: companies[2]._id,
        isActive: true,
      },
      {
        name: 'Web Development',
        description: 'Desarrollo de sitios web y aplicaciones',
        companyId: companies[2]._id,
        isActive: true,
      },
    ];

    for (const area of areas) {
      const existing = await AreaModel.findOne({ 
        name: area.name, 
        companyId: area.companyId 
      });
      if (!existing) {
        await AreaModel.create(area);
        const company = companies.find(c => (c as any)._id.toString() === (area.companyId as any).toString());
        this.log(`Created area: ${area.name} for company ${company?.name}`);
      }
    }
  }

  async clear(): Promise<void> {
    await this.connectDB();
    await AreaModel.deleteMany({});
    this.log('Cleared all areas');
  }
}
