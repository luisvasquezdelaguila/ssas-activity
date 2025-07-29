import { connectTestDB, disconnectTestDB, clearTestDB } from './test-app';

// Configuración global para tests
beforeAll(async () => {
  // Conectar a la base de datos de test
  await connectTestDB();
});

// Limpiar la base de datos antes de cada test
beforeEach(async () => {
  await clearTestDB();
});

// Cerrar la conexión después de todos los tests
afterAll(async () => {
  await disconnectTestDB();
});
