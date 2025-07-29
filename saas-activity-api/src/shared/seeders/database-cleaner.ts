import mongoose from 'mongoose';

// Simple logger usando console
const logger = {
  info: (message: string, ...args: any[]) => console.log(`ℹ️  ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`❌ ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`⚠️  ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`🐛 ${message}`, ...args),
};

interface CollectionStats {
  name: string;
  documentCount: number;
}

interface DatabaseStats {
  totalCollections: number;
  collections: CollectionStats[];
}

export class DatabaseCleaner {
  /**
   * Limpia todas las colecciones de la base de datos
   */
  static async cleanDatabase(): Promise<void> {
    try {
      logger.info('🧹 Iniciando limpieza de la base de datos...');

      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('No hay conexión a la base de datos');
      }

      // Obtener todas las colecciones
      const collections = await db.listCollections().toArray();
      
      if (collections.length === 0) {
        logger.info('📦 No hay colecciones para limpiar');
        return;
      }

      logger.info(`📋 Encontradas ${collections.length} colecciones`);

      // Eliminar todas las colecciones
      const deletePromises = collections.map(async (collection) => {
        const collectionName = collection.name;
        try {
          await db.collection(collectionName).deleteMany({});
          logger.info(`✅ Colección '${collectionName}' limpiada`);
          return collectionName;
        } catch (error) {
          logger.error(`❌ Error limpiando colección '${collectionName}':`, error);
          throw error;
        }
      });

      await Promise.all(deletePromises);

      logger.info('🎉 Base de datos limpiada exitosamente');
    } catch (error) {
      logger.error('❌ Error limpiando la base de datos:', error);
      throw error;
    }
  }

  /**
   * Limpia colecciones específicas
   */
  static async cleanCollections(collectionNames: string[]): Promise<void> {
    try {
      logger.info(`🧹 Limpiando colecciones específicas: ${collectionNames.join(', ')}`);

      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('No hay conexión a la base de datos');
      }

      const deletePromises = collectionNames.map(async (collectionName) => {
        try {
          const result = await db.collection(collectionName).deleteMany({});
          logger.info(`✅ Colección '${collectionName}' limpiada - ${result.deletedCount} documentos eliminados`);
          return { collection: collectionName, deletedCount: result.deletedCount };
        } catch (error) {
          logger.error(`❌ Error limpiando colección '${collectionName}':`, error);
          throw error;
        }
      });

      const results = await Promise.all(deletePromises);
      const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);

      logger.info(`🎉 Limpieza completada - ${totalDeleted} documentos eliminados en total`);
    } catch (error) {
      logger.error('❌ Error limpiando colecciones específicas:', error);
      throw error;
    }
  }

  /**
   * Elimina completamente las colecciones (drop)
   */
  static async dropAllCollections(): Promise<void> {
    try {
      logger.info('🗑️ Eliminando todas las colecciones...');

      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('No hay conexión a la base de datos');
      }

      // Obtener todas las colecciones
      const collections = await db.listCollections().toArray();
      
      if (collections.length === 0) {
        logger.info('📦 No hay colecciones para eliminar');
        return;
      }

      logger.info(`📋 Encontradas ${collections.length} colecciones para eliminar`);

      // Eliminar (drop) todas las colecciones
      const dropPromises = collections.map(async (collection) => {
        const collectionName = collection.name;
        try {
          await db.collection(collectionName).drop();
          logger.info(`✅ Colección '${collectionName}' eliminada completamente`);
          return collectionName;
        } catch (error) {
          logger.error(`❌ Error eliminando colección '${collectionName}':`, error);
          throw error;
        }
      });

      await Promise.all(dropPromises);

      logger.info('🎉 Todas las colecciones eliminadas exitosamente');
    } catch (error) {
      logger.error('❌ Error eliminando colecciones:', error);
      throw error;
    }
  }

  /**
   * Resetea la base de datos (limpia y recrea índices)
   */
  static async resetDatabase(): Promise<void> {
    try {
      logger.info('🔄 Reseteando base de datos...');

      // Limpiar todas las colecciones
      await this.cleanDatabase();

      // Recrear índices si es necesario
      logger.info('🔧 Recreando índices...');
      
      // Aquí puedes agregar lógica para recrear índices específicos si es necesario
      // Ejemplo:
      // await mongoose.model('User').createIndexes();
      // await mongoose.model('Company').createIndexes();

      logger.info('🎉 Base de datos reseteada exitosamente');
    } catch (error) {
      logger.error('❌ Error reseteando la base de datos:', error);
      throw error;
    }
  }

  /**
   * Verifica el estado de la base de datos
   */
  static async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('No hay conexión a la base de datos');
      }

      const collections = await db.listCollections().toArray();
      const stats: DatabaseStats = {
        totalCollections: collections.length,
        collections: []
      };

      for (const collection of collections) {
        const collectionName = collection.name;
        const count = await db.collection(collectionName).countDocuments();
        stats.collections.push({
          name: collectionName,
          documentCount: count
        });
      }

      return stats;
    } catch (error) {
      logger.error('❌ Error obteniendo estadísticas de la base de datos:', error);
      throw error;
    }
  }
}
