import mongoose from 'mongoose';
import { MONGO_URI, DB_NAME } from '../src/config/env/database';

// Configuración global para tests
beforeAll(async () => {
  // Conectar a la base de datos de test
  const testDbName = `${DB_NAME}_test`;
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI, {
      dbName: testDbName
    });
  }
});

// Limpiar la base de datos antes de cada test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cerrar la conexión después de todos los tests
afterAll(async () => {
  await mongoose.connection.close();
});
