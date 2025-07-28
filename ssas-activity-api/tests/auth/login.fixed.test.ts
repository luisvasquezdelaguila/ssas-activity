import request from 'supertest';
import { createTestApp } from '../test-app';
import { TestDataFactory } from '../test-data-factory';
import bcrypt from 'bcryptjs';

const app = createTestApp();

describe('POST /api/auth/login', () => {
  let testCompany: any;
  let testUser: any;

  beforeEach(async () => {
    // Crear compañía para los tests
    testCompany = await TestDataFactory.createTestCompany({
      name: 'Test Company',
      domain: 'testcompany.com'
    });

    // Crear usuario para los tests
    testUser = await TestDataFactory.createTestUser({
      email: 'testuser@example.com',
      name: 'Test User',
      password: await bcrypt.hash('password123', 10),
      companyId: testCompany._id
    });
  });

  describe('Casos de éxito', () => {
    it('debería hacer login correctamente con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token'); // Typo en el controlador
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('testuser@example.com');
      expect(response.body.data.user).not.toHaveProperty('password'); // No debe devolver la contraseña
    });

    it('debería hacer login con super admin', async () => {
      const superAdmin = await TestDataFactory.createTestUser({
        email: 'superadmin@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'super_admin'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('super_admin');
    });

    it('debería hacer login con company admin', async () => {
      const companyAdmin = await TestDataFactory.createTestUser({
        email: 'admin@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'company_admin',
        companyId: testCompany._id
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('company_admin');
      expect(response.body.data.user.companyId).toBe(testCompany._id.toString());
    });
  });

  describe('Casos de error', () => {
    it('debería fallar con email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inexistente@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('debería fallar con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('debería fallar sin email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('debería fallar sin contraseña', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería fallar con email inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'email-invalido',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('debería fallar con usuario inactivo', async () => {
      const inactiveUser = await TestDataFactory.createTestUser({
        email: 'inactive@example.com',
        password: await bcrypt.hash('password123', 10),
        isActive: false
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });
  });

  describe('Validación de token JWT', () => {
    it('debería generar un token JWT válido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.access_token).toBeDefined();
      
      // El token debería tener 3 partes separadas por puntos
      const tokenParts = response.body.access_token.split('.');
      expect(tokenParts).toHaveLength(3);
    });

    it('debería incluir información del usuario en el token payload', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      
      // Decodificar el payload del token (segunda parte)
      const token = response.body.access_token;
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      expect(payload).toHaveProperty('sub'); // subject (user ID)
      expect(payload).toHaveProperty('aud'); // audience
      expect(payload).toHaveProperty('exp'); // expiration
      expect(payload).toHaveProperty('jti'); // jwt ID
    });
  });

  describe('Diferentes roles de usuario', () => {
    it('debería permitir login a operador', async () => {
      const operator = await TestDataFactory.createTestUser({
        email: 'operator@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'operator',
        companyId: testCompany._id
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'operator@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('operator');
    });

    it('debería permitir login a usuario regular', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('user');
    });
  });
});
