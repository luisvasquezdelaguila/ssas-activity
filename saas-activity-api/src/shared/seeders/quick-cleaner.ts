import { DatabaseCleaner } from './database-cleaner';
import { BaseSeeder } from './base-seeder';

/**
 * Script simple para limpiar la base de datos
 * Usar este archivo cuando necesites limpiar la DB desde otro script
 */
export class QuickDatabaseCleaner extends BaseSeeder {
  
  // Implementación requerida por BaseSeeder
  async run(): Promise<void> {
    await this.cleanAll();
  }

  async clear(): Promise<void> {
    await DatabaseCleaner.cleanDatabase();
  }
  
  /**
   * Limpia toda la base de datos y muestra estadísticas
   */
  async cleanAll(): Promise<void> {
    try {
      console.log('🧹 Iniciando limpieza completa de la base de datos...');
      
      await this.connectDB();
      
      // Mostrar estadísticas antes
      const statsBefore = await DatabaseCleaner.getDatabaseStats();
      console.log('\n📊 Estado ANTES de la limpieza:');
      console.log(`Total de colecciones: ${statsBefore.totalCollections}`);
      
      if (statsBefore.collections.length > 0) {
        statsBefore.collections.forEach(collection => {
          console.log(`  ${collection.name.padEnd(20)} - ${collection.documentCount} documentos`);
        });
      }
      
      // Limpiar
      await DatabaseCleaner.cleanDatabase();
      
      // Mostrar estadísticas después
      const statsAfter = await DatabaseCleaner.getDatabaseStats();
      console.log('\n📊 Estado DESPUÉS de la limpieza:');
      console.log(`Total de colecciones: ${statsAfter.totalCollections}`);
      
      if (statsAfter.collections.length > 0) {
        statsAfter.collections.forEach(collection => {
          console.log(`  ${collection.name.padEnd(20)} - ${collection.documentCount} documentos`);
        });
      }
      
      await this.disconnectDB();
      console.log('✨ Limpieza completada exitosamente');
      
    } catch (error) {
      console.error('❌ Error durante la limpieza:', error);
      throw error;
    }
  }

  /**
   * Resetea completamente la base de datos
   */
  async resetAll(): Promise<void> {
    try {
      console.log('🔄 Iniciando reset completo de la base de datos...');
      
      await this.connectDB();
      await DatabaseCleaner.resetDatabase();
      await this.disconnectDB();
      
      console.log('✨ Reset completado exitosamente');
      
    } catch (error) {
      console.error('❌ Error durante el reset:', error);
      throw error;
    }
  }

  /**
   * Elimina colecciones específicas
   */
  async cleanSpecificCollections(collectionNames: string[]): Promise<void> {
    try {
      console.log(`🧹 Limpiando colecciones específicas: ${collectionNames.join(', ')}`);
      
      await this.connectDB();
      await DatabaseCleaner.cleanCollections(collectionNames);
      await this.disconnectDB();
      
      console.log('✨ Limpieza específica completada exitosamente');
      
    } catch (error) {
      console.error('❌ Error durante la limpieza específica:', error);
      throw error;
    }
  }

  /**
   * Muestra solo las estadísticas
   */
  async showStats(): Promise<void> {
    try {
      await this.connectDB();
      
      const stats = await DatabaseCleaner.getDatabaseStats();
      console.log('\n📊 Estadísticas de la base de datos:');
      console.log(`Total de colecciones: ${stats.totalCollections}`);
      
      if (stats.collections.length > 0) {
        console.log('\nDetalle por colección:');
        stats.collections.forEach(collection => {
          console.log(`  ${collection.name.padEnd(20)} - ${collection.documentCount} documentos`);
        });
      } else {
        console.log('🗃️  No hay colecciones en la base de datos');
      }
      
      await this.disconnectDB();
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Función de utilidad para uso rápido
export async function quickCleanDB() {
  const cleaner = new QuickDatabaseCleaner();
  await cleaner.cleanAll();
}

export async function quickStatsDB() {
  const cleaner = new QuickDatabaseCleaner();
  await cleaner.showStats();
}

export async function quickResetDB() {
  const cleaner = new QuickDatabaseCleaner();
  await cleaner.resetAll();
}
