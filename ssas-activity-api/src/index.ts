import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import appConfig from './config/env/server';
// Swagger/OpenAPI setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.4',
    info: {
      title: 'SSAS Activity API',
      version: '1.0.0',
      description: 'API para gestión de actividades',
      license: {
        name: 'Apache 2.0', // License name
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html', // License URL
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        OAuth2Password: {
          type: 'oauth2',
          flows: {
            password: {
              tokenUrl: '/api/auth/login', // Tu endpoint de login que retorna el token
              scopes: {},
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
      {
        OAuth2Password: [],
      },
    ],
  },
  apis: ['./src/infrastructure/web/*.routes.ts'], // Puedes agregar más rutas aquí
};


import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
// import dotenv from 'dotenv';
import { MONGO_URI, DB_NAME } from './config/env/database';

import planRoutes from './infrastructure/web/plan.routes';
import companyRoutes from './infrastructure/web/company.routes';
import userRoutes from './infrastructure/web/user.routes';
import activityRoutes from './infrastructure/web/activity.routes';
import areaRoutes from './infrastructure/web/area.routes';
import authRoutes from './infrastructure/web/auth.routes';

// dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  dbName: DB_NAME,
  useUnifiedTopology: true,
} as any)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/areas', areaRoutes);

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const PORT = appConfig.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
