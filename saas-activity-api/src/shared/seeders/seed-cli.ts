#!/usr/bin/env node

import mongoose from 'mongoose';
import { MasterSeeder } from './index';
import { CompanySeeder } from './company-seeder';
import { UserSeeder } from './user-seeder';
import { AreaSeeder } from './area-seeder';
import { ActivitySeeder } from './activity-seeder';
import { PlanSeeder } from './plan-seeder';
import { MONGO_URI, DB_NAME } from '../../config/env/database';

// Función para conectar a la base de datos
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME
    });
  }
}

// Configuración de argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0];

const seeders = {
  all: () => new MasterSeeder(),
  companies: () => new CompanySeeder(),
  users: () => new UserSeeder(),
  areas: () => new AreaSeeder(),
  activities: () => new ActivitySeeder(),
  plans: () => new PlanSeeder(),
};

const commands = {
  all: 'Ejecuta todos los seeders en orden',
  companies: 'Ejecuta solo el seeder de compañías',
  users: 'Ejecuta solo el seeder de usuarios',
  areas: 'Ejecuta solo el seeder de áreas',
  activities: 'Ejecuta solo el seeder de actividades',
  plans: 'Ejecuta solo el seeder de planes',
  clear: 'Limpia todos los datos antes de ejecutar seeders',
  help: 'Muestra esta ayuda'
};

async function showHelp() {
  console.log('\n🌱 Database Seeder - Herramientas para poblar la base de datos\n');
  console.log('Uso: npm run seed <comando>\n');
  console.log('Comandos disponibles:');
  Object.entries(commands).forEach(([cmd, description]) => {
    console.log(`  ${cmd.padEnd(12)} - ${description}`);
  });
  console.log('\nEjemplos:');
  console.log('  npm run seed all                 # Ejecuta todos los seeders');
  console.log('  npm run seed:users              # Solo usuarios');
  console.log('  npm run seed:companies          # Solo compañías');
  console.log('  npm run db:seed                 # Limpia y regenera todo');
  console.log('  npm run seed help               # Muestra esta ayuda\n');
}

async function executeSeeder() {
  try {
    // Conectar a la base de datos
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    const seederName = command as keyof typeof seeders;
    
    if (!seederName || !seeders[seederName]) {
      console.log(`❌ Comando desconocido: ${command || '(ninguno)'}`);
      await showHelp();
      process.exit(1);
    }

    const seeder = seeders[seederName]();
    
    console.log(`🌱 Ejecutando seeder: ${seederName}`);
    await seeder.run();
    console.log(`✅ Seeder '${seederName}' completado exitosamente`);

  } catch (error) {
    console.error('❌ Error ejecutando seeder:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión a la base de datos
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

async function executeClearAndSeed() {
  try {
    // Conectar a la base de datos
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      for (const collection of collections) {
        await db.collection(collection.name).deleteMany({});
        console.log(`✅ Colección '${collection.name}' limpiada`);
      }
    }

    // Ejecutar todos los seeders
    console.log('🌱 Ejecutando todos los seeders...');
    const masterSeeder = new MasterSeeder();
    await masterSeeder.run();
    console.log('✅ Todos los seeders completados exitosamente');

  } catch (error) {
    console.error('❌ Error ejecutando clear and seed:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión a la base de datos
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Verificar comandos especiales
if (!command) {
  showHelp().then(() => process.exit(0));
} else if (command === 'help' || command === '--help' || command === '-h') {
  showHelp().then(() => process.exit(0));
} else if (command === 'clear') {
  executeClearAndSeed();
} else {
  executeSeeder();
}
