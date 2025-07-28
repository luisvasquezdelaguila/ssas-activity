// src/shared/seeders/user-seeder.ts

import { BaseSeeder } from './base-seeder';
import UserModel from '../../infrastructure/db/user.model';
import CompanyModel from '../../infrastructure/db/company.model';
import bcrypt from 'bcryptjs';

export class UserSeeder extends BaseSeeder {
  async run(): Promise<void> {
    await this.connectDB();
    
    const companies = await CompanyModel.find();
    if (companies.length === 0) {
      this.log('No companies found. Run company seeder first.');
      return;
    }

    const users = [
      {
        email: 'superadmin@ssas.com',
        name: 'Super Administrator',
        password: await bcrypt.hash('admin123', 10),
        phone: '+51999888777',
        role: 'super_admin',
        isActive: true,
      },
      {
        email: 'admin@techcorp.com',
        name: 'John Smith',
        password: await bcrypt.hash('admin123', 10),
        phone: '+51987654321',
        role: 'company_admin',
        companyId: companies[0]._id,
        isActive: true,
      },
      {
        email: 'operator@techcorp.com',
        name: 'Jane Doe',
        password: await bcrypt.hash('operator123', 10),
        phone: '+51987654322',
        role: 'operator',
        companyId: companies[0]._id,
        isActive: true,
      },
      {
        email: 'user1@techcorp.com',
        name: 'Mike Johnson',
        password: await bcrypt.hash('user123', 10),
        phone: '+51941194064',
        role: 'user',
        companyId: companies[0]._id,
        isActive: true,
      },
      {
        email: 'admin@globalmarketing.com',
        name: 'Sarah Wilson',
        password: await bcrypt.hash('admin123', 10),
        phone: '+1555123456',
        role: 'company_admin',
        companyId: companies[1]._id,
        isActive: true,
      },
      {
        email: 'user1@globalmarketing.com',
        name: 'David Brown',
        password: await bcrypt.hash('user123', 10),
        phone: '+1555123457',
        role: 'user',
        companyId: companies[1]._id,
        isActive: true,
      },
      {
        email: 'designer@creativedesign.com',
        name: 'Emma Garcia',
        password: await bcrypt.hash('user123', 10),
        phone: '+34666777888',
        role: 'user',
        companyId: companies[2]._id,
        isActive: true,
      },
      {
        email: 'dev@creativedesign.com',
        name: 'Carlos Rodriguez',
        password: await bcrypt.hash('user123', 10),
        phone: '+34666777889',
        role: 'operator',
        companyId: companies[2]._id,
        isActive: true,
      },
    ];

    for (const user of users) {
      const existing = await UserModel.findOne({ email: user.email });
      if (!existing) {
        await UserModel.create(user);
        this.log(`Created user: ${user.email} (${user.role})`);
      }
    }
  }

  async clear(): Promise<void> {
    await this.connectDB();
    await UserModel.deleteMany({});
    this.log('Cleared all users');
  }
}
