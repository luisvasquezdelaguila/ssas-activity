import request from 'supertest';
import { createTestApp } from '../test-app';
import { TestDataFactory } from '../test-data-factory';
import bcrypt from 'bcryptjs';

const app = createTestApp();

describe('Activity API Tests', () => {
  let testCompany: any;
  let testUser: any;
  let testUser2: any;
  let adminUser: any;
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    // Crear compañía de prueba
    testCompany = await TestDataFactory.createTestCompany({
      name: 'Test Company Activities',
      domain: 'testactivities.com'
    });

    // Crear usuarios de prueba
    testUser = await TestDataFactory.createTestUser({
      email: 'user1@test.com',
      name: 'Test User 1',
      password: await bcrypt.hash('password123', 10),
      companyId: testCompany._id.toString(),
      role: 'user'
    });

    testUser2 = await TestDataFactory.createTestUser({
      email: 'user2@test.com',
      name: 'Test User 2',
      password: await bcrypt.hash('password123', 10),
      companyId: testCompany._id.toString(),
      role: 'user'
    });

    adminUser = await TestDataFactory.createTestUser({
      email: 'admin@test.com',
      name: 'Admin User',
      password: await bcrypt.hash('password123', 10),
      companyId: testCompany._id.toString(),
      role: 'company_admin'
    });

    // Obtener tokens de autenticación
    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'password123'
      });

    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });

    userToken = userLoginResponse.body.acesss_token;
    adminToken = adminLoginResponse.body.acesss_token;
  });

  describe('POST /api/activities', () => {
    it('debería crear una nueva actividad correctamente', async () => {
      const activityData = {
        title: 'Nueva actividad de prueba',
        description: 'Descripción de la actividad',
        assignedTo: testUser2._id.toString(),
        startTime: new Date('2025-12-01T09:00:00Z'),
        endTime: new Date('2025-12-01T17:00:00Z')
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${userToken}`)
        .send(activityData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activity).toHaveProperty('id');
      expect(response.body.data.activity.title).toBe(activityData.title);
      expect(response.body.data.activity.status).toBe('pending');
      expect(response.body.data.activity.assignedTo).toBe(activityData.assignedTo);
      expect(response.body.data.activity.createdBy).toBe(testUser._id.toString());
    });

    it('debería fallar sin token de autenticación', async () => {
      const activityData = {
        title: 'Nueva actividad',
        assignedTo: testUser2._id.toString()
      };

      const response = await request(app)
        .post('/api/activities')
        .send(activityData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Token de acceso requerido');
    });

    it('debería fallar sin título', async () => {
      const activityData = {
        assignedTo: testUser2._id.toString()
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${userToken}`)
        .send(activityData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('título');
    });

    it('debería fallar sin usuario asignado', async () => {
      const activityData = {
        title: 'Nueva actividad'
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${userToken}`)
        .send(activityData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('asignada');
    });
  });

  describe('GET /api/activities/pending', () => {
    let testActivity: any;

    beforeEach(async () => {
      testActivity = await TestDataFactory.createTestActivity({
        title: 'Actividad pendiente',
        assignedTo: testUser._id.toString(),
        createdBy: adminUser._id.toString(),
        companyId: testCompany._id.toString(),
        status: 'pending'
      });
    });

    it('debería obtener actividades pendientes del usuario', async () => {
      const response = await request(app)
        .get('/api/activities/pending')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(1);
      expect(response.body.data.activities[0].status).toBe('pending');
      expect(response.body.data.activities[0].assignedTo).toBe(testUser._id.toString());
    });

    it('debería devolver array vacío si no hay actividades pendientes', async () => {
      const response = await request(app)
        .get('/api/activities/pending')
        .set('Authorization', `Bearer ${adminToken}`); // Admin no tiene actividades asignadas

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(0);
    });
  });

  describe('GET /api/activities/my-activities', () => {
    beforeEach(async () => {
      // Crear varias actividades con diferentes estados
      await TestDataFactory.createTestActivity({
        title: 'Actividad pendiente',
        assignedTo: testUser._id.toString(),
        createdBy: adminUser._id.toString(),
        companyId: testCompany._id.toString(),
        status: 'pending'
      });

      await TestDataFactory.createTestActivity({
        title: 'Actividad en progreso',
        assignedTo: testUser._id.toString(),
        createdBy: adminUser._id.toString(),
        companyId: testCompany._id.toString(),
        status: 'in_progress'
      });

      await TestDataFactory.createTestActivity({
        title: 'Actividad completada',
        assignedTo: testUser._id.toString(),
        createdBy: adminUser._id.toString(),
        companyId: testCompany._id.toString(),
        status: 'completed'
      });
    });

    it('debería obtener todas las actividades del usuario', async () => {
      const response = await request(app)
        .get('/api/activities/my-activities')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(3);
      
      // Verificar que todas las actividades pertenecen al usuario
      response.body.data.activities.forEach((activity: any) => {
        expect(activity.assignedTo).toBe(testUser._id.toString());
      });
    });
  });

  describe('GET /api/activities/:id', () => {
    let testActivity: any;

    beforeEach(async () => {
      testActivity = await TestDataFactory.createTestActivity({
        title: 'Actividad para obtener',
        assignedTo: testUser._id.toString(),
        createdBy: adminUser._id.toString(),
        companyId: testCompany._id.toString()
      });
    });

    it('debería obtener una actividad por ID', async () => {
      const response = await request(app)
        .get(`/api/activities/${testActivity._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activity.id).toBe(testActivity._id.toString());
      expect(response.body.data.activity.title).toBe(testActivity.title);
    });

    it('debería devolver 404 para actividad inexistente', async () => {
      const response = await request(app)
        .get('/api/activities/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('no encontrada');
    });
  });

  describe('PATCH /api/activities/:id/status', () => {
    let testActivity: any;

    beforeEach(async () => {
      testActivity = await TestDataFactory.createTestActivity({
        title: 'Actividad para actualizar',
        assignedTo: testUser._id.toString(),
        createdBy: adminUser._id.toString(),
        companyId: testCompany._id.toString(),
        status: 'pending'
      });
    });

    it('debería actualizar el estado de la actividad', async () => {
      const statusUpdate = {
        status: 'in_progress',
        startTime: new Date('2025-12-01T09:00:00Z')
      };

      const response = await request(app)
        .patch(`/api/activities/${testActivity._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(statusUpdate);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activity.status).toBe('in_progress');
      expect(response.body.data.activity.statusHistory).toHaveLength(2); // Estado inicial + nuevo estado
    });

    it('debería fallar con transición de estado inválida', async () => {
      // Primero completar la actividad
      await request(app)
        .patch(`/api/activities/${testActivity._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'completed' });

      // Intentar cambiar a in_progress (no permitido desde completed)
      const response = await request(app)
        .patch(`/api/activities/${testActivity._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'in_progress' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('No se puede cambiar');
    });
  });

  describe('PATCH /api/activities/:id/reassign', () => {
    let testActivity: any;

    beforeEach(async () => {
      testActivity = await TestDataFactory.createTestActivity({
        title: 'Actividad para reasignar',
        assignedTo: testUser._id.toString(),
        createdBy: adminUser._id.toString(),
        companyId: testCompany._id.toString(),
        status: 'pending'
      });
    });

    it('debería reasignar la actividad a otro usuario', async () => {
      const reassignData = {
        assignedTo: testUser2._id.toString()
      };

      const response = await request(app)
        .patch(`/api/activities/${testActivity._id}/reassign`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reassignData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activity.assignedTo).toBe(testUser2._id.toString());
      expect(response.body.data.activity.statusHistory).toHaveLength(2); // Asignación inicial + reasignación
    });

    it('debería fallar al reasignar actividad completada', async () => {
      // Completar la actividad primero
      await request(app)
        .patch(`/api/activities/${testActivity._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'completed' });

      const reassignData = {
        assignedTo: testUser2._id.toString()
      };

      const response = await request(app)
        .patch(`/api/activities/${testActivity._id}/reassign`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reassignData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('No se puede reasignar una actividad completada');
    });
  });

  describe('GET /api/activities/company', () => {
    beforeEach(async () => {
      // Crear actividades de la compañía
      await TestDataFactory.createTestActivity({
        title: 'Actividad 1',
        assignedTo: testUser._id.toString(),
        createdBy: adminUser._id.toString(),
        companyId: testCompany._id.toString()
      });

      await TestDataFactory.createTestActivity({
        title: 'Actividad 2',
        assignedTo: testUser2._id.toString(),
        createdBy: adminUser._id.toString(),
        companyId: testCompany._id.toString()
      });
    });

    it('debería permitir a admin ver todas las actividades de la compañía', async () => {
      const response = await request(app)
        .get('/api/activities/company')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(2);
    });

    it('debería denegar acceso a usuario regular', async () => {
      const response = await request(app)
        .get('/api/activities/company')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('No tienes permisos');
    });
  });
});
