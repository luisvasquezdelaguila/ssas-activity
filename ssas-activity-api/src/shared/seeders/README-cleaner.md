# Database Cleaner 🧹

Herramientas para limpiar y gestionar la base de datos MongoDB del proyecto SSAS Activity Platform.

## 🚀 Uso Rápido

### Scripts NPM

```bash
# Mostrar ayuda
npm run db:clean help

# Mostrar estadísticas de la DB
npm run db:stats

# Limpiar todas las colecciones (borra documentos)
npm run db:clean clean

# Resetear completamente la DB
npm run db:reset

# Eliminar todas las colecciones (drop)
npm run db:drop

# Limpiar colecciones específicas
npm run db:clean collections users,companies,areas
```

### Línea de Comandos

```bash
# Usando ts-node directamente
ts-node src/shared/seeders/db-cleaner-cli.ts clean
ts-node src/shared/seeders/db-cleaner-cli.ts stats
ts-node src/shared/seeders/db-cleaner-cli.ts reset
```

## 📚 Uso Programático

### Funciones de Utilidad Rápidas

```typescript
import { quickCleanDB, quickStatsDB, quickResetDB } from './shared/seeders/quick-cleaner';

// Limpiar toda la DB
await quickCleanDB();

// Mostrar estadísticas
await quickStatsDB();

// Reset completo
await quickResetDB();
```

### Clase QuickDatabaseCleaner

```typescript
import { QuickDatabaseCleaner } from './shared/seeders/quick-cleaner';

const cleaner = new QuickDatabaseCleaner();

// Limpiar colecciones específicas
await cleaner.cleanSpecificCollections(['users', 'companies']);

// Limpiar todo con estadísticas
await cleaner.cleanAll();

// Solo mostrar estadísticas
await cleaner.showStats();

// Reset completo
await cleaner.resetAll();
```

### Clase DatabaseCleaner (Avanzado)

```typescript
import mongoose from 'mongoose';
import { DatabaseCleaner } from './shared/seeders/database-cleaner';

// Conectar a la DB
await mongoose.connect(process.env.MONGODB_URI);

// Limpiar todas las colecciones
await DatabaseCleaner.cleanDatabase();

// Limpiar colecciones específicas
await DatabaseCleaner.cleanCollections(['users', 'areas']);

// Eliminar todas las colecciones (drop)
await DatabaseCleaner.dropAllCollections();

// Reset completo
await DatabaseCleaner.resetDatabase();

// Obtener estadísticas
const stats = await DatabaseCleaner.getDatabaseStats();
console.log(stats);

// Cerrar conexión
await mongoose.disconnect();
```

## 🛠️ Métodos Disponibles

### DatabaseCleaner

| Método | Descripción |
|--------|-------------|
| `cleanDatabase()` | Limpia todas las colecciones (borra documentos pero mantiene estructura) |
| `cleanCollections(names)` | Limpia colecciones específicas |
| `dropAllCollections()` | Elimina completamente todas las colecciones |
| `resetDatabase()` | Limpia y recrea índices |
| `getDatabaseStats()` | Obtiene estadísticas de la DB |

### QuickDatabaseCleaner

| Método | Descripción |
|--------|-------------|
| `cleanAll()` | Limpia toda la DB mostrando estadísticas antes/después |
| `resetAll()` | Reset completo de la DB |
| `cleanSpecificCollections(names)` | Limpia colecciones específicas |
| `showStats()` | Muestra solo estadísticas |

## ⚠️ Advertencias de Seguridad

- **NUNCA** ejecutes estos comandos en producción sin confirmación
- Los comandos `drop` y `reset` son **irreversibles**
- En producción, los comandos destructivos están bloqueados automáticamente
- Siempre haz backup antes de operaciones destructivas

## 🔧 Variables de Entorno

```bash
MONGODB_URI=mongodb://localhost:27017/ssas-activity
NODE_ENV=development
```

## 📝 Ejemplos Completos

### Ejemplo 1: Limpieza de Desarrollo

```typescript
// Desarrollo diario - limpiar y regenerar datos
import { quickCleanDB } from './shared/seeders/quick-cleaner';
import { MasterSeeder } from './shared/seeders';

await quickCleanDB();           // Limpiar
const seeder = new MasterSeeder();
await seeder.run();            // Regenerar datos
```

### Ejemplo 2: Testing

```typescript
// Antes de cada test
beforeEach(async () => {
  const cleaner = new QuickDatabaseCleaner();
  await cleaner.cleanAll();
});
```

### Ejemplo 3: Migración de Datos

```typescript
// Backup específico antes de migración
const stats = await DatabaseCleaner.getDatabaseStats();
console.log('Estado antes de migración:', stats);

// Limpiar colecciones obsoletas
await DatabaseCleaner.cleanCollections(['old_users', 'deprecated_data']);

// Verificar resultado
const newStats = await DatabaseCleaner.getDatabaseStats();
console.log('Estado después de limpieza:', newStats);
```

## 🐛 Troubleshooting

### Error de conexión
```bash
Error: No hay conexión a la base de datos
```
**Solución**: Verificar que MongoDB esté ejecutándose y la variable `MONGODB_URI` esté configurada.

### Permisos insuficientes
```bash
Error: MongoServerError: not authorized
```
**Solución**: Verificar credenciales de MongoDB y permisos de escritura.

### Comando bloqueado en producción
```bash
❌ Comando no permitido en producción
```
**Solución**: Cambiar `NODE_ENV` o ejecutar manualmente con confirmación.

## 📊 Logs y Monitoreo

Todos los comandos generan logs detallados:

```
ℹ️  🧹 Iniciando limpieza de la base de datos...
ℹ️  📋 Encontradas 5 colecciones
ℹ️  ✅ Colección 'users' limpiada
ℹ️  ✅ Colección 'companies' limpiada
ℹ️  🎉 Base de datos limpiada exitosamente
```
