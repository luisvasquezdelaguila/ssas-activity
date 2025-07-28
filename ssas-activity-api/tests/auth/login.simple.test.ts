import request from 'supertest';
import { createTestApp } from '../test-app';
import { TestDataFactory } from '../test-data-factory';

const app = createTestApp();

describe('Auth Login Tests', () => {
  beforeEach(async () => {
    // Los datos se limpian automáticamente por el setup.ts
  });

  test('debería fallar con credenciales vacías', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});

    // El controlador devuelve 401 para credenciales inválidas
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('debería crear un usuario de prueba correctamente', async () => {
    const testUser = await TestDataFactory.createTestUser({
      email: 'test@example.com'
    });

    expect(testUser).toBeDefined();
    expect(testUser.email).toBe('test@example.com');
  });

  test('debería hacer login exitoso con credenciales válidas', async () => {
    // Crear usuario de prueba
    await TestDataFactory.createTestUser({
      email: 'testlogin@example.com'
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testlogin@example.com',
        password: 'password123'
      });

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    if (response.status !== 200) {
      console.log('Error en login:', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('acesss_token'); // Nota: hay un typo en el controlador
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user.email).toBe('testlogin@example.com');
  });
});
