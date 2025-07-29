import CompanyModel from '../src/infrastructure/db/company.model';
import UserModel from '../src/infrastructure/db/user.model';
import PlanModel from '../src/infrastructure/db/plan.model';
import AreaModel from '../src/infrastructure/db/area.model';
import ActivityModel from '../src/infrastructure/db/activity.model';
import bcrypt from 'bcryptjs';
import request from 'supertest';

export class TestDataFactory {

    /**
     * Crear un plan de prueba
     */
    static async createTestPlan(overrides: any = {}) {
        const defaultPlan = {
            name: 'Test Plan',
            description: 'Plan de prueba',
            maxUsers: 10,
            maxProjects: 5,
            maxActivities: 100,
            features: ['basic_support'],
            price: 29.99,
            duration: 30,
            isActive: true,
            ...overrides
        };

        return await PlanModel.create(defaultPlan);
    }

    /**
     * Crear una compañía de prueba
     */
    static async createTestCompany(overrides: any = {}) {
        let planId = overrides.planId;

        if (!planId) {
            const plan = await this.createTestPlan();
            planId = plan._id;
        }

        const defaultCompany = {
            name: 'Test Company',
            // domain: 'testcompany.com',
            domain: `testcompany-${Date.now()}.com`, // Unique domain
            planId,
            settings: {
                timezone: 'America/Lima',
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
     * Crear un área de prueba
     */
    static async createTestArea(companyId: string, overrides: any = {}) {
        const defaultArea = {
            name: 'Test Area',
            description: 'Área de prueba',
            companyId,
            isActive: true,
            ...overrides
        };

        return await AreaModel.create(defaultArea);
    }

    /**
     * Crear un usuario de prueba
     */
    static async createTestUser(overrides: any = {}) {
        const hashedPassword = await bcrypt.hash(overrides.password, 10);
        const uniqueEmail = overrides.email || `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;

        const defaultUser = {
            name: overrides.name || 'Test User',
            email: uniqueEmail,
            password: hashedPassword,
            phone: overrides.phone || `+5198765432${Math.floor(Math.random() * 10)}`,
            role: overrides.role || 'user',
            isActive: true,
            companyId: overrides.companyId || null,
            areaId: overrides.areaId || null,
        };

        return await UserModel.create(defaultUser);
    }

    /**
     * Crear un super admin de prueba
     */
    static async createTestSuperAdmin(overrides: any = {}) {
        console.log('Creating test super admin with overrides:', overrides);
        return this.createTestUser({
            name: 'Super Admin Test',
            email: 'superadmin@test.com',
            phone: '+51999888777',
            role: 'super_admin',
            password: 'aveces', // Default password
            //   ...overrides
        });
    }

    /**
     * Crear un admin de compañía de prueba
     */
    static async createTestCompanyAdmin(companyId: string, areaId?: string, overrides: any = {}) {
        return this.createTestUser({
            // name: 'Company Admin Test',
            name: overrides.name || `Company Admin - ${Date.now()}`,
            email: overrides.email || `admin-${Date.now()}@test.com`, // Unique email
            phone: '+51987654322',
            role: 'company_admin',
            password: 'aveces',
            companyId,
            areaId,
            //   ...overrides
        });
    }

    /**
     * Crear una actividad de prueba
     */
    static async createTestActivity(createdById: string, overrides: any = {}) {
        const defaultActivity = {
            // title: 'Test Activity',
            title: `Test Activity - ${Date.now()}`, // Unique title
            // description: 'Actividad de prueba',
            description: 'Actividad de prueba',
            status: 'pending',
            priority: 'medium',
            createdBy: createdById,
            assignedTo: overrides.assignedTo || createdById,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde ahora
            ...overrides
        };

        return await ActivityModel.create(defaultActivity);
    }

    /**
     * Crear un setup completo de prueba (company + users + areas + activities)
     */
    static async createCompleteTestSetup() {
        // Crear plan
        const plan = await this.createTestPlan();

        // Crear compañía
        const company = await this.createTestCompany({ planId: plan._id });
        const companyId = (company as any)._id.toString();

        // Crear áreas
        const area1 = await this.createTestArea(companyId, { name: 'Desarrollo' });
        const area2 = await this.createTestArea(companyId, { name: 'Marketing' });
        const area1Id = (area1 as any)._id.toString();
        const area2Id = (area2 as any)._id.toString();

        // Crear usuarios
        const superAdmin = await this.createTestSuperAdmin();
        const companyAdmin = await this.createTestCompanyAdmin(companyId, area1Id);
        const user1 = await this.createTestUser({
            //   email: 'user1@test.com',
            //random_email
            email: `user1-${Date.now()}@test.com`,
            name: `User 1 - ${Date.now()}`, // Unique name
            companyId,
            areaId: area1Id,
            role: 'user',
            password: 'aveces'
        });
        const user2 = await this.createTestUser({
            email: `user2-${Date.now()}@test.com`,
            name: `User 2 - ${Date.now()}`, // Unique name
            companyId,
            areaId: area2Id,
            role: 'operator',
            password: 'aveces'
        });

        const companyAdminId = (companyAdmin as any)._id.toString();
        const user1Id = (user1 as any)._id.toString();
        const user2Id = (user2 as any)._id.toString();

        // Crear actividades
        const activity1 = await this.createTestActivity(companyAdminId, {
            //   title: 'Actividad 1',
            title: `Actividad 1 - ${Date.now()}`, // Unique title
            assignedTo: user1Id,
            companyId,
            areaId: area1Id
        });

        const activity2 = await this.createTestActivity(companyAdminId, {
            // title: 'Actividad 2',
            title: `Actividad 2 - ${Date.now()}`, // Unique title
            assignedTo: user2Id,
            companyId,
            areaId: area2Id,
            status: 'in_progress'
        });

        return {
            plan,
            company,
            areas: { area1, area2 },
            users: { superAdmin, companyAdmin, user1, user2 },
            activities: { activity1, activity2 }
        };
    }

    /**
     * Generar token de autenticación para un usuario
     */
    static async loginUser(app: any, email: string, password: string = 'aveces') {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email, password });  // Usar email (versión corregida del controlador)

        return response.body.access_token || response.body.acesss_token; // Handle typo in controller
    }
}
