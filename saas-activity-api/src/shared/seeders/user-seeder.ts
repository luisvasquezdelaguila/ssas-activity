// src/shared/seeders/user-seeder.enhanced.ts

import { BaseSeeder } from './base-seeder';
import UserModel from '../../infrastructure/db/user.model';
import CompanyModel from '../../infrastructure/db/company.model';
import AreaModel from '../../infrastructure/db/area.model';
import bcrypt from 'bcryptjs';

export class UserSeeder extends BaseSeeder {
  async run(): Promise<void> {
    await this.connectDB();
    
    const companies = await CompanyModel.find();
    if (companies.length === 0) {
      this.log('No companies found. Run company seeder first.');
      return;
    }

    const areas = await AreaModel.find();
    this.log(`Found ${companies.length} companies and ${areas.length} areas`);

    // Crear usuarios organizados por compañía
    await this.createUsersForEachCompany(companies, areas);
    
    // Mostrar estadísticas
    await this.showStatistics();
  }

  private async createUsersForEachCompany(companies: any[], areas: any[]) {
    // Super Admin (sin compañía)
    await this.createSuperAdmin();

    for (const company of companies) {
      this.log(`\n🏢 Creating users for company: ${company.name}`);
      
      // Obtener áreas de esta compañía
      const companyAreas = areas.filter(area => 
        area.companyId && area.companyId.toString() === company._id.toString()
      );

      // Crear admin de compañía
      await this.createCompanyAdmin(company, companyAreas[0]);
      
      // Crear usuarios según el tipo de compañía
      if (company.name.toLowerCase().includes('tech')) {
        await this.createTechCompanyUsers(company, companyAreas);
      } else if (company.name.toLowerCase().includes('marketing')) {
        await this.createMarketingCompanyUsers(company, companyAreas);
      } else if (company.name.toLowerCase().includes('design')) {
        await this.createDesignCompanyUsers(company, companyAreas);
      } else {
        await this.createGenericCompanyUsers(company, companyAreas);
      }
    }
  }

  private async createSuperAdmin() {
    const superAdminData = {
      email: 'superadmin@ssas.com',
      name: 'Super Administrator',
      password: await bcrypt.hash('aveces', 10),
      phone: '+51999888777',
      role: 'super_admin',
      isActive: true,
    };

    const existing = await UserModel.findOne({ email: superAdminData.email });
    if (!existing) {
      await UserModel.create(superAdminData);
      this.log(`✅ Created Super Admin: ${superAdminData.email}`);
    }
  }

  private async createCompanyAdmin(company: any, primaryArea?: any) {
    const adminData = {
      email: `admin@${this.getEmailDomain(company.name)}`,
      name: `${company.name} Administrator`,
      password: await bcrypt.hash('aveces', 10),
      phone: this.generatePhoneNumber(company.name, 0),
      role: 'company_admin',
      companyId: company._id,
      areaId: primaryArea?._id,
      isActive: true,
    };

    const existing = await UserModel.findOne({ email: adminData.email });
    if (!existing) {
      await UserModel.create(adminData);
      this.log(`   ✅ Created Admin: ${adminData.email} (${adminData.role})`);
    }
  }

  private async createTechCompanyUsers(company: any, areas: any[]) {
    const devArea = areas.find(a => a.name.toLowerCase().includes('desarrollo')) || areas[0];
    const qaArea = areas.find(a => a.name.toLowerCase().includes('calidad')) || areas[1] || areas[0];

    const users = [
      {
        email: `developer@${this.getEmailDomain(company.name)}`,
        name: 'Senior Developer',
        password: await bcrypt.hash('aveces', 10),
        phone: this.generatePhoneNumber(company.name, 1),
        role: 'user',
        companyId: company._id,
        areaId: devArea?._id,
        isActive: true,
      },
      {
        email: `qa@${this.getEmailDomain(company.name)}`,
        name: 'QA Engineer',
        password: await bcrypt.hash('aveces', 10),
        phone: this.generatePhoneNumber(company.name, 2),
        role: 'operator',
        companyId: company._id,
        areaId: qaArea?._id,
        isActive: true,
      },
      {
        email: `junior@${this.getEmailDomain(company.name)}`,
        name: 'Junior Developer',
        password: await bcrypt.hash('aveces', 10),
        phone: this.generatePhoneNumber(company.name, 3),
        role: 'user',
        companyId: company._id,
        areaId: devArea?._id,
        isActive: true,
      }
    ];

    await this.createUsers(users);
  }

  private async createMarketingCompanyUsers(company: any, areas: any[]) {
    const marketingArea = areas.find(a => a.name.toLowerCase().includes('marketing')) || areas[0];
    const contentArea = areas.find(a => a.name.toLowerCase().includes('contenido')) || areas[1] || areas[0];

    const users = [
      {
        email: `marketing@${this.getEmailDomain(company.name)}`,
        name: 'Marketing Specialist',
        password: await bcrypt.hash('aveces', 10),
        phone: this.generatePhoneNumber(company.name, 1),
        role: 'user',
        companyId: company._id,
        areaId: marketingArea?._id,
        isActive: true,
      },
      {
        email: `content@${this.getEmailDomain(company.name)}`,
        name: 'Content Creator',
        password: await bcrypt.hash('aveces', 10),
        phone: this.generatePhoneNumber(company.name, 2),
        role: 'operator',
        companyId: company._id,
        areaId: contentArea?._id,
        isActive: true,
      },
      {
        email: `social@${this.getEmailDomain(company.name)}`,
        name: 'Social Media Manager',
        password: await bcrypt.hash('aveces', 10),
        phone: this.generatePhoneNumber(company.name, 3),
        role: 'user',
        companyId: company._id,
        areaId: marketingArea?._id,
        isActive: true,
      }
    ];

    await this.createUsers(users);
  }

  private async createDesignCompanyUsers(company: any, areas: any[]) {
    const designArea = areas.find(a => a.name.toLowerCase().includes('diseño')) || areas[0];
    const uiArea = areas.find(a => a.name.toLowerCase().includes('ui')) || areas[1] || areas[0];

    const users = [
      {
        email: `designer@${this.getEmailDomain(company.name)}`,
        name: 'Senior Designer',
        password: await bcrypt.hash('aveces', 10),
        phone: this.generatePhoneNumber(company.name, 1),
        role: 'user',
        companyId: company._id,
        areaId: designArea?._id,
        isActive: true,
      },
      {
        email: `ui@${this.getEmailDomain(company.name)}`,
        name: 'UI/UX Designer',
        password: await bcrypt.hash('aveces', 10),
        phone: this.generatePhoneNumber(company.name, 2),
        role: 'operator',
        companyId: company._id,
        areaId: uiArea?._id,
        isActive: true,
      }
    ];

    await this.createUsers(users);
  }

  private async createGenericCompanyUsers(company: any, areas: any[]) {
    const users = [
      {
        email: `employee1@${this.getEmailDomain(company.name)}`,
        name: 'Employee One',
        password: await bcrypt.hash('aveces', 10),
        phone: this.generatePhoneNumber(company.name, 1),
        role: 'user',
        companyId: company._id,
        areaId: areas[0]?._id,
        isActive: true,
      },
      {
        email: `operator@${this.getEmailDomain(company.name)}`,
        name: 'Operator User',
        password: await bcrypt.hash('aveces', 10),
        phone: this.generatePhoneNumber(company.name, 2),
        role: 'operator',
        companyId: company._id,
        areaId: areas[1]?._id || areas[0]?._id,
        isActive: true,
      }
    ];

    await this.createUsers(users);
  }

  private async createUsers(users: any[]) {
    for (const userData of users) {
      const existing = await UserModel.findOne({ email: userData.email });
      if (!existing) {
        await UserModel.create(userData);
        this.log(`   ✅ Created: ${userData.email} (${userData.role})`);
      }
    }
  }

  private getEmailDomain(companyName: string): string {
    return companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '') + '.com';
  }

  private generatePhoneNumber(companyName: string, userIndex: number): string {
    // Generar números de teléfono únicos basados en el nombre de la compañía
    const basePhone = '+51';
    const companyCode = companyName.length.toString().padStart(2, '0');
    const userCode = userIndex.toString().padStart(2, '0');
    const randomDigits = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    
    return `${basePhone}9${companyCode}${userCode}${randomDigits}`;
  }

  private async showStatistics() {
    const totalUsers = await UserModel.countDocuments();
    
    const usersByRole = await UserModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const usersByCompany = await UserModel.aggregate([
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $group: {
          _id: {
            companyName: { $ifNull: [{ $arrayElemAt: ['$company.name', 0] }, 'Sin Compañía'] }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    this.log(`\n📊 User Statistics:`);
    this.log(`   Total users: ${totalUsers}`);
    this.log(`   By role:`);
    usersByRole.forEach(stat => {
      this.log(`     ${stat._id}: ${stat.count}`);
    });
    this.log(`   By company:`);
    usersByCompany.forEach(stat => {
      this.log(`     ${stat._id.companyName}: ${stat.count}`);
    });
  }

  async clear(): Promise<void> {
    await this.connectDB();
    await UserModel.deleteMany({});
    this.log('Cleared all users');
  }
}
