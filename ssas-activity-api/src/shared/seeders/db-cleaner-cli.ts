#!/usr/bin/env node

import mongoose from 'mongoose';
import {MONGO_URI, DB_NAME} from '../../config/env/database';
import { DatabaseCleaner } from './database-cleaner';

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

const commands = {
  clean: 'Limpia todas las colecciones (borra documentos)',
  drop: 'Elimina todas las colecciones completamente',
  reset: 'Resetea la base de datos (limpia y recrea índices)',
  stats: 'Muestra estadísticas de la base de datos',
  collections: 'Limpia colecciones específicas (separadas por comas)',
  help: 'Muestra esta ayuda'
};

async function showHelp() {
  console.log('\n🧹 Database Cleaner - Herramientas de limpieza de MongoDB\n');
  console.log('Uso: npm run db:clean <comando> [opciones]\n');
  console.log('Comandos disponibles:');
  Object.entries(commands).forEach(([cmd, description]) => {
    console.log(`  ${cmd.padEnd(12)} - ${description}`);
  });
  console.log('\nEjemplos:');
  console.log('  npm run db:clean clean                    # Limpia todas las colecciones');
  console.log('  npm run db:clean drop                     # Elimina todas las colecciones');
  console.log('  npm run db:clean reset                    # Resetea la base de datos');
  console.log('  npm run db:clean stats                    # Muestra estadísticas');
  console.log('  npm run db:clean collections users,areas  # Limpia colecciones específicas');
  console.log('  npm run db:clean help                     # Muestra esta ayuda\n');
}

async function executeCommand() {
  try {
    // Conectar a la base de datos
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    switch (command) {
      case 'clean':
        await DatabaseCleaner.cleanDatabase();
        break;

      case 'drop':
        console.log('⚠️  ADVERTENCIA: Esto eliminará completamente todas las colecciones');
        console.log('⚠️  ¿Estás seguro? Esta acción no se puede deshacer');
        
        // En un entorno de producción, aquí podrías agregar una confirmación
        if (process.env.NODE_ENV === 'production') {
          console.log('❌ Comando no permitido en producción');
          process.exit(1);
        }
        
        await DatabaseCleaner.dropAllCollections();
        break;

      case 'reset':
        console.log('⚠️  ADVERTENCIA: Esto reseteará completamente la base de datos');
        
        if (process.env.NODE_ENV === 'production') {
          console.log('❌ Comando no permitido en producción');
          process.exit(1);
        }
        
        await DatabaseCleaner.resetDatabase();
        break;

      case 'stats':
        const stats = await DatabaseCleaner.getDatabaseStats();
        console.log('\n📊 Estadísticas de la base de datos:');
        console.log(`Total de colecciones: ${stats.totalCollections}`);
        
        if (stats.collections.length > 0) {
          console.log('\nDetalle por colección:');
          stats.collections.forEach(collection => {
            console.log(`  ${collection.name.padEnd(20)} - ${collection.documentCount} documentos`);
          });
        }
        break;

      case 'collections':
        const collectionsArg = args[1];
        if (!collectionsArg) {
          console.log('❌ Debes especificar las colecciones a limpiar');
          console.log('Ejemplo: npm run db:clean collections users,companies,areas');
          process.exit(1);
        }
        
        const collectionNames = collectionsArg.split(',').map(name => name.trim());
        await DatabaseCleaner.cleanCollections(collectionNames);
        break;

      case 'help':
      case '--help':
      case '-h':
        await showHelp();
        break;

      default:
        console.log(`❌ Comando desconocido: ${command || '(ninguno)'}`);
        await showHelp();
        process.exit(1);
    }

    console.log('✨ Operación completada exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando comando:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión a la base de datos
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Verificar si se proporcionó un comando
if (!command) {
  showHelp().then(() => process.exit(0));
} else {
  executeCommand();
}
