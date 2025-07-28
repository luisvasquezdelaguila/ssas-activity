import request from 'supertest';
import { createTestApp } from '../test-app';
import { TestDataFactory } from '../test-data-factory';

const app = createTestApp();

describe('POST /api/auth/login', () => {
  let testCompany: any;
  let testUser: any;

  beforeEach(async () => {
    // Crear datos de prueba
    testCompany = await TestDataFactory.createTestCompany();
    testUser = await TestDataFactory.createTestUser({
      email: 'testuser@example.com',
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
      expect(response.body).toHaveProperty('acesss_token'); // Typo en el controlador
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('testuser@example.com');
      expect(response.body.data.user).not.toHaveProperty('password'); // No debe devolver la contraseña
    });

    it('debería hacer login con super admin', async () => {
      const superAdmin = await TestDataFactory.createTestSuperAdmin();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('super_admin');
    });

    it('debería hacer login con company admin', async () => {
      const companyAdmin = await TestDataFactory.createTestCompanyAdmin(testCompany._id);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
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
          password: 'passwordIncorrecta'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('debería fallar sin email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('debería fallar sin contraseña', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('debería fallar con email inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'emailinvalido',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('debería fallar con usuario inactivo', async () => {
      // Crear usuario inactivo
      await TestDataFactory.createTestUser({
        email: 'inactive@example.com',
        isActive: false
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Account is disabled');
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
      expect(response.body.token).toBeDefined();
      
      // El token debería tener 3 partes separadas por puntos
      const tokenParts = response.body.token.split('.');
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
      const token = response.body.token;
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('role');
      expect(payload.email).toBe('testuser@example.com');
    });
  });

  describe('Diferentes roles de usuario', () => {
    it('debería permitir login a operador', async () => {
      const operator = await TestDataFactory.createTestOperator(testCompany._id);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'operator@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('operator');
    });

    it('debería permitir login a usuario regular', async () => {
      const regularUser = await TestDataFactory.createTestRegularUser(testCompany._id);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('user');
    });
  });
});
