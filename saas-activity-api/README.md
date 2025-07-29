# SSAS Activity API

API REST para el sistema de gestión de actividades empresariales SSAS (Software as a Service Activity System).

## 🚀 Características

- ✅ **Gestión completa de actividades** - Crear, consultar, actualizar estados y reasignar
- 👥 **Sistema multi-usuario** - Soporte para múltiples empresas y usuarios
- 🔐 **Autenticación JWT** - Autenticación segura por email y teléfono
- 📱 **API RESTful** - Endpoints bien estructurados y documentados
- 🗄️ **MongoDB** - Base de datos NoSQL escalable
- 🏗️ **Arquitectura hexagonal** - Código limpio y mantenible
- 📊 **Relaciones pobladas** - Información completa de usuarios y empresas
- 🔄 **Historial de cambios** - Seguimiento completo de estados de actividades

## 📋 Prerequisitos

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd ssas-activity-api
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

4. **Editar el archivo `.env`** con tus configuraciones:
   - Configurar URI de MongoDB
   - Generar llaves JWT
   - Configurar puerto y otras variables

5. **Generar llaves JWT (opcional)**
```bash
# Generar llave privada
openssl genrsa -out private.pem 4096

# Generar llave pública
openssl rsa -in private.pem -pubout -out public.pem

# Copiar el contenido de las llaves al .env
```

## 🚦 Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

## 📚 API Endpoints

### Autenticación

#### Login por Email
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@empresa.com",
  "password": "password123"
}
```

#### Login por Teléfono
```http
POST /api/auth/phone-login
Content-Type: application/json

{
  "phone": "+51987654321"
}
```

### Actividades

#### Obtener actividades pendientes
```http
GET /api/activities/pending
Authorization: Bearer <token>
```

#### Obtener actividad por ID
```http
GET /api/activities/:id
Authorization: Bearer <token>
```

#### Crear nueva actividad
```http
POST /api/activities
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Nueva actividad",
  "description": "Descripción de la actividad",
  "assignedTo": "userId",
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T17:00:00Z"
}
```

#### Actualizar estado de actividad
```http
PUT /api/activities/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress",
  "startTime": "2024-01-15T09:00:00Z"
}
```

#### Reasignar actividad
```http
PUT /api/activities/:id/reassign
Authorization: Bearer <token>
Content-Type: application/json

{
  "assignedTo": "newUserId"
}
```

### Usuarios

#### Obtener actividades pendientes por teléfono
```http
GET /api/users/pending-by-phone/:phone
Authorization: Bearer <token>
```

## 🏗️ Estructura del Proyecto

```
ssas-activity-api/
├── src/
│   ├── application/           # Casos de uso
│   │   ├── activity.usecase.ts
│   │   ├── auth.usecase.ts
│   │   └── user.usecase.ts
│   ├── domain/               # Entidades y repositorios
│   │   ├── activity.entity.ts
│   │   ├── activity.repository.ts
│   │   ├── user.entity.ts
│   │   └── user.repository.ts
│   ├── infrastructure/       # Implementaciones
│   │   ├── db/              # Modelos de base de datos
│   │   ├── repositories/    # Implementaciones de repositorios
│   │   └── web/            # Controladores HTTP
│   ├── shared/              # Utilidades compartidas
│   └── index.ts            # Punto de entrada
├── .env.example
├── package.json
└── README.md
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development`, `production` |
| `MONGO_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/ssas` |
| `MONGO_DATABASE` | Nombre de la base de datos | `ssas-activity` |
| `PORT` | Puerto del servidor | `3000` |
| `APP_PRIVATE_KEY` | Llave privada JWT | Ver `.env.example` |
| `APP_PUBLIC_KEY` | Llave pública JWT | Ver `.env.example` |
| `APP_DEBUG` | Modo debug | `true`, `false` |

### Estructura de Base de Datos

#### Colecciones Principales

- **users** - Información de usuarios
- **companies** - Datos de empresas
- **activities** - Actividades del sistema
- **areas** - Áreas organizacionales

#### Relaciones

- `Activity.assignedTo` → `User._id`
- `Activity.createdBy` → `User._id`
- `Activity.companyId` → `Company._id`
- `User.companyId` → `Company._id`

## 🔐 Autenticación y Autorización

### JWT Tokens

El sistema utiliza tokens JWT con las siguientes características:

- **Algoritmo**: RS256 (RSA con SHA-256)
- **Expiración**: 24 horas
- **Payload**: userId, email, role, companyId

### Roles de Usuario

- **super_admin** - Acceso completo al sistema
- **company_admin** - Gestión de su empresa
- **operator** - Operaciones dentro de su empresa
- **user** - Gestión de sus propias actividades

## 📱 Integración con MCP

Este API está diseñado para integrarse con Model Context Protocol (MCP) para automatización con IA:

- **MCP Server**: `/mcp-activity/`
- **Herramientas disponibles**: Consulta de actividades por teléfono
- **Integración**: WhatsApp → N8N → Claude/ChatGPT + MCP → SSAS API

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch
```

## 📦 Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Variables de Entorno para Producción

```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ssas-activity
APP_DEBUG=false
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

- **Email**: soporte@ssas-activity.com
- **Documentación**: [docs.ssas-activity.com](https://docs.ssas-activity.com)
- **Issues**: [GitHub Issues](https://github.com/luisvasquezdelaguila/ssas-activity/issues)

## 🔄 Changelog

### v1.0.0 (2025-01-XX)
- ✅ Sistema de autenticación por email y teléfono
- ✅ CRUD completo de actividades
- ✅ Relaciones pobladas con usuarios y empresas
- ✅ Historial de cambios de estado
- ✅ API RESTful documentada
- ✅ Integración con MCP

---

**Desarrollado con ❤️ para la gestión eficiente de actividades empresariales**
