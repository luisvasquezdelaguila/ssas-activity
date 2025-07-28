#!/usr/bin/env node

/**
 * Script de prueba para verificar el funcionamiento del Database Cleaner
 * 
 * Ejecutar con: npm run test:cleaner
 */

import { QuickDatabaseCleaner } from './quick-cleaner';
import { MasterSeeder } from './index';

async function testDatabaseCleaner() {
  console.log('🧪 Iniciando pruebas del Database Cleaner\n');

  const cleaner = new QuickDatabaseCleaner();
  const seeder = new MasterSeeder();

  try {
    // Test 1: Mostrar estadísticas iniciales
    console.log('📊 Test 1: Estadísticas iniciales');
    await cleaner.showStats();

    // Test 2: Generar algunos datos de prueba
    console.log('\n🌱 Test 2: Generando datos de prueba');
    await seeder.run();
    
    // Test 3: Mostrar estadísticas después del seeding
    console.log('\n📊 Test 3: Estadísticas después del seeding');
    await cleaner.showStats();

    // Test 4: Limpiar colecciones específicas
    console.log('\n🧹 Test 4: Limpiando colecciones específicas (users, activities)');
    await cleaner.cleanSpecificCollections(['users', 'activities']);

    // Test 5: Mostrar estadísticas después de limpieza parcial
    console.log('\n📊 Test 5: Estadísticas después de limpieza parcial');
    await cleaner.showStats();

    // Test 6: Limpieza completa
    console.log('\n🧹 Test 6: Limpieza completa');
    await cleaner.cleanAll();

    // Test 7: Verificar que todo esté limpio
    console.log('\n📊 Test 7: Verificación final');
    await cleaner.showStats();

    console.log('\n✅ Todas las pruebas completadas exitosamente');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error);
    throw error;
  }
}

// Ejecutar solo si este archivo se ejecuta directamente
if (require.main === module) {
  testDatabaseCleaner()
    .then(() => {
      console.log('\n🎉 Pruebas finalizadas exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fallo en las pruebas:', error);
      process.exit(1);
    });
}

export { testDatabaseCleaner };
