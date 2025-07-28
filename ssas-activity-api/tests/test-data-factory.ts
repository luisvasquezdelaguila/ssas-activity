import CompanyModel from '../src/infrastructure/db/company.model';
import UserModel from '../src/infrastructure/db/user.model';
import bcrypt from 'bcryptjs';

export class TestDataFactory {
  
  /**
   * Crear una compañía de prueba
   */
  static async createTestCompany(overrides: any = {}) {
    const defaultCompany = {
      name: 'Test Company',
      domain: 'testcompany.com',
      settings: {
        timezone: 'America/New_York',
        workingHours: {
          start: '09:00',
          end: '18:00',
        },
        allowUserSelfRegistration: true,
      },
      isActive: true,
      ...overrides
    };

    return await CompanyModel.create(defaultCompany);
  }

  /**
   * Crear un usuario de prueba
   */
  static async createTestUser(overrides: any = {}) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const defaultUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      phone: '+51987654321',
      role: 'user',
      isActive: true,
      ...overrides
    };

    return await UserModel.create(defaultUser);
  }

  /**
   * Crear un super admin de prueba
   */
  static async createTestSuperAdmin() {
    return await this.createTestUser({
      name: 'Super Admin',
      email: 'superadmin@test.com',
      role: 'super_admin'
    });
  }

  /**
   * Crear un admin de compañía de prueba
   */
  static async createTestCompanyAdmin(companyId: string) {
    return await this.createTestUser({
      name: 'Company Admin',
      email: 'admin@test.com',
      role: 'company_admin',
      companyId
    });
  }

  /**
   * Crear un operador de prueba
   */
  static async createTestOperator(companyId: string) {
    return await this.createTestUser({
      name: 'Test Operator',
      email: 'operator@test.com',
      role: 'operator',
      companyId
    });
  }

  /**
   * Crear un usuario regular de prueba
   */
  static async createTestRegularUser(companyId: string) {
    return await this.createTestUser({
      name: 'Regular User',
      email: 'user@test.com',
      role: 'user',
      companyId
    });
  }

  /**
   * Crear una actividad de prueba
   */
  static async createTestActivity(overrides: any = {}) {
    const ActivityModel = require('../src/infrastructure/db/activity.model').default;
    
    const defaultActivity = {
      title: 'Actividad de prueba',
      description: 'Descripción de actividad de prueba',
      status: 'pending',
      assignedTo: '507f1f77bcf86cd799439011', // ObjectId de ejemplo
      createdBy: '507f1f77bcf86cd799439012', // ObjectId de ejemplo
      companyId: '507f1f77bcf86cd799439013', // ObjectId de ejemplo
      statusHistory: [{
        status: 'pending',
        changedBy: '507f1f77bcf86cd799439012',
        changedAt: new Date(),
        assignedTo: '507f1f77bcf86cd799439011',
      }],
      isActive: true,
      ...overrides
    };

    return await ActivityModel.create(defaultActivity);
  }
}
