# SSAS Activity MCP Server

Un servidor MCP (Model Context Protocol) para interactuar con la API de SSAS Activity. Este servidor permite a los agentes de IA realizar operaciones CRUD en actividades a través de herramientas estructuradas.

## Características

- 🔐 **Autenticación por teléfono**: Autentica usuarios usando su número de teléfono
- 📋 **Gestión de actividades**: CRUD completo de actividades (crear, leer, actualizar, reasignar)
- 🛠️ **Herramientas MCP**: 7 herramientas especializadas para diferentes operaciones
- 🔒 **Seguridad**: Uso de tokens JWT para todas las operaciones autenticadas
- ⚡ **TypeScript**: Completamente tipado para mejor desarrollo

## Herramientas disponibles

### 1. `authenticate_by_phone`
Autentica un usuario por su número de teléfono y obtiene un token de acceso.

**Parámetros:**
- `phone` (string): Número de teléfono con código de país (ej: +51987654321)

**Respuesta:**
```json
{
  "token": "jwt_token_here",
  "user": { ... },
  "expiresIn": "24h"
}
```

### 2. `get_user_pending_activities`
Obtiene las actividades pendientes del usuario autenticado.

**Parámetros:**
- `token` (string): Token JWT del usuario

**Respuesta:**
```json
[
  {
    "id": "...",
    "title": "Tarea pendiente",
    "status": "pending",
    ...
  }
]
```

### 3. `get_user_activities`
Obtiene todas las actividades del usuario (pendientes, en progreso, completadas).

**Parámetros:**
- `token` (string): Token JWT del usuario

### 4. `get_activity_by_id`
Obtiene los detalles de una actividad específica.

**Parámetros:**
- `activityId` (string): ID de la actividad
- `token` (string): Token JWT del usuario

### 5. `create_activity`
Crea una nueva actividad.

**Parámetros:**
- `title` (string): Título de la actividad
- `description` (string, opcional): Descripción
- `assignedTo` (string): ID del usuario asignado
- `startTime` (string, opcional): Fecha de inicio (ISO 8601)
- `endTime` (string, opcional): Fecha de fin (ISO 8601)
- `token` (string): Token JWT del usuario

### 6. `update_activity_status`
Actualiza el estado de una actividad.

**Parámetros:**
- `activityId` (string): ID de la actividad
- `status` (string): Nuevo estado (pending, in_progress, completed, cancelled)
- `token` (string): Token JWT del usuario

### 7. `reassign_activity`
Reasigna una actividad a otro usuario.

**Parámetros:**
- `activityId` (string): ID de la actividad
- `assignedTo` (string): ID del nuevo usuario
- `reason` (string, opcional): Razón de la reasignación
- `token` (string): Token JWT del usuario

## Instalación

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## Configuración

### Variables de entorno

```bash
# URL base de la API de SSAS Activity
SSAS_API_URL=http://localhost:3000

# Modo de desarrollo (opcional)
NODE_ENV=development
```

## Uso con agentes de IA

### Ejemplo de flujo típico:

1. **Autenticación**:
   ```
   Herramienta: authenticate_by_phone
   Parámetros: { "phone": "+51987654321" }
   Resultado: { "token": "jwt_token", ... }
   ```

2. **Consultar actividades pendientes**:
   ```
   Herramienta: get_user_pending_activities
   Parámetros: { "token": "jwt_token" }
   Resultado: [{ "id": "...", "title": "Tarea 1", ... }]
   ```

3. **Actualizar estado de actividad**:
   ```
   Herramienta: update_activity_status
   Parámetros: { 
     "activityId": "...", 
     "status": "in_progress", 
     "token": "jwt_token" 
   }
   ```

## Arquitectura

```
MCP Server
├── Tools (Herramientas MCP)
├── API Client (Cliente HTTP)
└── Types (Tipos TypeScript)
    ↓
SSAS Activity API
    ↓
MongoDB Database
```

## Desarrollo

### Estructura del proyecto

```
src/
├── index.ts              # Servidor MCP principal
├── tools/
│   └── activity-tools.ts  # Herramientas de actividades
├── services/
│   └── api-client.ts      # Cliente HTTP para la API
└── types/
    └── api.types.ts       # Tipos TypeScript
```

### Agregar nuevas herramientas

1. Definir la herramienta en `ActivityTools`
2. Implementar la lógica en `ApiClient`
3. Agregar el case en `executeTool`
4. Actualizar la documentación

## Manejo de errores

El servidor MCP maneja errores de forma consistente:

- **Errores de autenticación**: Token inválido o expirado
- **Errores de validación**: Parámetros faltantes o inválidos
- **Errores de API**: Errores del servidor de SSAS Activity
- **Errores de red**: Problemas de conectividad

Todos los errores se devuelven con el formato:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: Descripción del error"
    }
  ],
  "isError": true
}
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

MIT License - ver archivo LICENSE para más detalles.
