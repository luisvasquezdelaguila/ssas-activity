// src/shared/seeders/index.ts

import { BaseSeeder } from './base-seeder';
import { PlanSeeder } from './plan-seeder';
import { CompanySeeder } from './company-seeder';
import { AreaSeeder } from './area-seeder';
import { UserSeeder } from './user-seeder';
import { ActivitySeeder } from './activity-seeder';

// Database Cleaners
export { DatabaseCleaner } from './database-cleaner';
export { QuickDatabaseCleaner, quickCleanDB, quickStatsDB, quickResetDB } from './quick-cleaner';

export class MasterSeeder extends BaseSeeder {
  private seeders: BaseSeeder[] = [
    new PlanSeeder(),
    new CompanySeeder(),
    new AreaSeeder(),
    new UserSeeder(),
    new ActivitySeeder(),
  ];

  async run(): Promise<void> {
    this.log('Starting database seeding...');
    
    for (const seeder of this.seeders) {
      try {
        await seeder.run();
        this.log(`✅ ${seeder.constructor.name} completed`);
      } catch (error) {
        this.log(`❌ ${seeder.constructor.name} failed: ${(error as Error).message}`);
        throw error;
      }
    }
    
    this.log('✅ All seeders completed successfully!');
  }

  async clear(): Promise<void> {
    this.log('Clearing all collections...');
    
    // Clear in reverse order to avoid foreign key issues
    const reversedSeeders = [...this.seeders].reverse();
    
    for (const seeder of reversedSeeders) {
      try {
        await seeder.clear();
        this.log(`✅ ${seeder.constructor.name} cleared`);
      } catch (error) {
        this.log(`❌ ${seeder.constructor.name} clear failed: ${(error as Error).message}`);
      }
    }
    
    this.log('✅ All collections cleared!');
  }

  async seed(): Promise<void> {
    await this.connectDB();
    await this.run();
    await this.disconnectDB();
  }

  async reset(): Promise<void> {
    await this.connectDB();
    await this.clear();
    await this.run();
    await this.disconnectDB();
  }
}

// Export individual seeders
export {
  PlanSeeder,
  CompanySeeder,
  AreaSeeder,
  UserSeeder,
  ActivitySeeder,
};
