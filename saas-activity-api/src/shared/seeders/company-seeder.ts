// src/shared/seeders/company-seeder.ts

import { BaseSeeder } from './base-seeder';
import CompanyModel from '../../infrastructure/db/company.model';

export class CompanySeeder extends BaseSeeder {
  async run(): Promise<void> {
    await this.connectDB();
    
    const companies = [
      {
        name: 'TechCorp Solutions',
        domain: 'techcorp.com',
        settings: {
          timezone: 'America/New_York',
          workingHours: {
            start: '09:00',
            end: '18:00',
          },
          allowUserSelfRegistration: true,
        },
        isActive: true,
      },
      {
        name: 'Global Marketing Inc',
        domain: 'globalmarketing.com',
        settings: {
          timezone: 'America/New_York',
          workingHours: {
            start: '08:00',
            end: '17:00',
          },
          allowUserSelfRegistration: false,
        },
        isActive: true,
      },
      {
        name: 'CreativeDesign Studio',
        domain: 'creativedesign.com',
        settings: {
          timezone: 'America/Los_Angeles',
          workingHours: {
            start: '10:00',
            end: '19:00',
          },
          allowUserSelfRegistration: true,
        },
        isActive: true,
      },
      {
        name: 'Innovate Consulting',
        domain: 'innovateconsulting.com',
        settings: {
          timezone: 'Europe/London',
          workingHours: {
            start: '09:00',
            end: '17:30',
          },
          allowUserSelfRegistration: false,
        },
        isActive: true,
      },
      {
        name: 'DataFlow Analytics',
        domain: 'dataflow.com',
        settings: {
          timezone: 'America/Chicago',
          workingHours: {
            start: '08:30',
            end: '17:30',
          },
          allowUserSelfRegistration: true,
        },
        isActive: true,
      },
    ];

    for (const company of companies) {
      const existing = await CompanyModel.findOne({ domain: company.domain });
      if (!existing) {
        await CompanyModel.create(company);
        this.log(`Created company: ${company.name} (${company.domain})`);
      }
    }
  }

  async clear(): Promise<void> {
    await this.connectDB();
    await CompanyModel.deleteMany({});
    this.log('Cleared all companies');
  }
}
