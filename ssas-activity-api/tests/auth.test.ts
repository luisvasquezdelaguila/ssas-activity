import request from 'supertest';
import { createTestApp } from './test-app';
import { TestDataFactory } from './test-data-factory';
import { email } from 'zod';

const app = createTestApp();

describe('Auth API Tests', () => {
  describe('POST /api/auth/login', () => {
    
    it('should login successfully with valid credentials', async () => {
      // Crear usuario de prueba
      const testUser = await TestDataFactory.createTestUser({
        email: 'test@example.com',
        password: 'aveces'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test@example.com',  // Usar username
          password: 'aveces'
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(
        response.body.access_token
      ).toBeDefined();
    });

    it('should fail with invalid password', async () => {
      await TestDataFactory.createTestUser({
        email: 'test@example.com',
        password: 'aveces'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test@example.com',  // Usar username
          password: 'wrongpassword'
        });
    console.log('Login response:', response.body);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent@example.com',  // Usar username
          password: 'aveces'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should login super admin successfully', async () => {
      const superAdmin = await TestDataFactory.createTestSuperAdmin({
        email: 'superadmin@test.com'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'superadmin@test.com',  // Usar username
          password: 'aveces'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user.role).toBe('super_admin');
    });

    it('should login company admin successfully', async () => {
      const { company } = await TestDataFactory.createCompleteTestSetup();
      const companyId = (company as any)._id.toString();

      const email = `admin-${Date.now()}@company.com`; // Unique email
      const companyAdmin = await TestDataFactory.createTestCompanyAdmin(companyId, undefined, {
        email
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: email,
          password: 'aveces'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user.role).toBe('company_admin');
      expect(response.body.data.user.companyId).toBe(companyId);
    });
  });
});
