import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configurar dotenv una sola vez con quiet option
dotenv.config({ quiet: true });

import { MONGO_URI, DB_NAME } from '../src/config/env/database';

import authRoutes from '../src/infrastructure/web/auth.routes';
import userRoutes from '../src/infrastructure/web/user.routes';
import companyRoutes from '../src/infrastructure/web/company.routes';
import planRoutes from '../src/infrastructure/web/plan.routes';
import areaRoutes from '../src/infrastructure/web/area.routes';
import activityRoutes from '../src/infrastructure/web/activity.routes';


export function createTestApp() {
  const app = express();
  
  app.use(cors());
  app.use(express.json());

  // Register routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/companies', companyRoutes);
  app.use('/api/plans', planRoutes);
  app.use('/api/areas', areaRoutes);
  app.use('/api/activities', activityRoutes);

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Test app error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  });

  return app;
}

export async function connectTestDB() {
  const testDbName = `${DB_NAME}_test`;
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI, {
      dbName: testDbName
    });
  }
}

export async function disconnectTestDB() {
  await mongoose.connection.close();
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}
