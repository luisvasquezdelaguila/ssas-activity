#!/usr/bin/env node

/**
 * Script de ejemplo para demostrar el uso del Database Cleaner
 * 
 * Ejecutar con: ts-node src/shared/seeders/example-cleaner.ts
 */

import { QuickDatabaseCleaner, quickCleanDB, quickStatsDB, quickResetDB } from './quick-cleaner';
import { DatabaseCleaner } from './database-cleaner';

async function exampleUsage() {
  console.log('🧹 Ejemplo de uso del Database Cleaner\n');

  try {
    // Opción 1: Usar funciones de utilidad rápidas
    console.log('📊 1. Mostrando estadísticas con función rápida:');
    await quickStatsDB();

    console.log('\n🧹 2. Limpiando DB con función rápida:');
    await quickCleanDB();

    // Opción 2: Usar la clase QuickDatabaseCleaner
    console.log('\n🔧 3. Usando la clase QuickDatabaseCleaner:');
    const cleaner = new QuickDatabaseCleaner();
    
    // Limpiar colecciones específicas
    await cleaner.cleanSpecificCollections(['users', 'companies']);
    
    // Mostrar estadísticas
    await cleaner.showStats();

    // Opción 3: Usar DatabaseCleaner directamente
    console.log('\n⚙️ 4. Usando DatabaseCleaner directamente:');
    
    // Necesitarías manejar la conexión manualmente
    // await mongoose.connect(...);
    // await DatabaseCleaner.cleanDatabase();
    // await mongoose.disconnect();

    console.log('\n✨ Ejemplo completado exitosamente');

  } catch (error) {
    console.error('❌ Error en el ejemplo:', error);
    process.exit(1);
  }
}

// Ejecutar el ejemplo si este archivo se ejecuta directamente
if (require.main === module) {
  exampleUsage()
    .then(() => {
      console.log('\n🎉 Ejemplo finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando ejemplo:', error);
      process.exit(1);
    });
}

export { exampleUsage };
