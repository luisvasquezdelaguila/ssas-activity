# SSAS Activity Platform

Sistema completo de gestión de actividades empresariales con arquitectura SaaS, API REST, frontend Next.js y automatización con IA.

## 🎯 Visión General

SSAS (Software as a Service Activity System) es una plataforma integral que permite a las empresas gestionar sus actividades de manera eficiente, con soporte para múltiples empresas, usuarios y automatización inteligente a través de WhatsApp y agentes de IA.

## 🏗️ Arquitectura del Sistema

```mermaid
graph TB
    subgraph "Frontend"
        A[Next.js App - saas-activity-platform]
        A1[Dashboard Empresarial]
        A2[Gestión de Usuarios]
        A3[Vista de Actividades]
        A4[Panel Super Admin]
    end
    
    subgraph "Backend"
        B[API REST - ssas-activity-api]
        B1[Autenticación JWT]
        B2[CRUD Actividades]
        B3[Gestión Empresas]
        B4[Usuarios & Roles]
    end
    
    subgraph "IA & Automatización"
        C[MCP Server - mcp-activity]
        C1[Consulta por Teléfono]
        C2[Integración WhatsApp]
        C3[Agentes N8N]
    end
    
    subgraph "Base de Datos"
        D[MongoDB]
        D1[Users]
        D2[Companies]
        D3[Activities]
        D4[Areas]
    end
    
    A --> B
    C --> B
    B --> D
    C1 -.-> A3
```

## 📁 Estructura del Proyecto

```
ssas-activity/
├── 📁 ssas-activity-api/          # API REST Backend
│   ├── src/
│   │   ├── application/           # Casos de uso
│   │   ├── domain/               # Entidades y reglas de negocio
│   │   ├── infrastructure/       # DB, Web, Repositorios
│   │   └── shared/               # Utilidades compartidas
│   ├── .env.example
│   └── README.md
│
├── 📁 saas-activity-platform/     # Frontend Next.js
│   ├── src/
│   │   ├── app/                  # App Router (Next.js 14)
│   │   ├── components/           # Componentes React + shadcn/ui
│   │   ├── stores/               # Estado global con Zustand
│   │   ├── lib/                  # Utilidades y validaciones
│   │   └── types/                # Tipos TypeScript
│   └── README.md
│
├── 📁 mcp-activity/               # MCP Server para IA
│   ├── src/
│   │   ├── services/             # Cliente API
│   │   ├── types/                # Tipos del MCP
│   │   └── index.ts              # Servidor MCP
│   ├── prompt-agente-n8n.txt     # Prompt para agentes IA
│   └── README.md
│
└── README.md                      # Este archivo
```

## 🚀 Características Principales

### 🎛️ **Panel de Administración Completo**
- **Super Admin**: Gestión de empresas y planes
- **Admin Empresarial**: Gestión de usuarios y actividades de su empresa
- **Operadores**: Vista y gestión de actividades asignadas
- **Usuarios**: Gestión de sus propias actividades

### 📱 **API REST Robusta**
- Autenticación JWT por email y teléfono
- CRUD completo de actividades con historial
- Relaciones pobladas (usuarios, empresas)
- Arquitectura hexagonal escalable
- Documentación completa de endpoints

### 🤖 **Automatización con IA**
- **MCP Server** para integración con Claude/ChatGPT
- **Consultas por WhatsApp** vía N8N
- **Agentes inteligentes** para gestión automática
- **Prompt engineering** optimizado para productividad

### 🏢 **Multi-tenant SaaS**
- Soporte para múltiples empresas
- Aislamiento de datos por empresa
- Gestión de planes y límites
- Áreas organizacionales personalizables

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes UI modernos
- **Zustand** - Gestión de estado global
- **Zod** - Validación de esquemas

### Backend
- **Node.js + Express** - Servidor HTTP
- **TypeScript** - Tipado estático
- **MongoDB + Mongoose** - Base de datos NoSQL
- **JWT** - Autenticación con tokens
- **Arquitectura Hexagonal** - Código limpio y mantenible

### IA & Automatización
- **MCP SDK** - Model Context Protocol
- **N8N** - Automatización de workflows
- **WhatsApp Evolution API** - Integración WhatsApp
- **Claude/ChatGPT** - Agentes conversacionales

## 🚦 Inicio Rápido

### 1. **Configurar Backend (API)**

```bash
cd ssas-activity-api

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env
# Editar .env con tu configuración de MongoDB y JWT

# Ejecutar en desarrollo
npm run dev
```

### 2. **Configurar Frontend**

```bash
cd saas-activity-platform

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### 3. **Configurar MCP Server**

```bash
cd mcp-activity

# Instalar dependencias
npm install

# Configurar variable de entorno
export SSAS_API_URL="http://localhost:3000"

# Ejecutar servidor MCP
npm run dev
```

## 🔧 Configuración por Entornos

### Desarrollo Local
```bash
# API Backend
MONGO_URI=mongodb://localhost:27017/ssas-activity
PORT=3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000

# MCP
SSAS_API_URL=http://localhost:3000
```

### Producción
```bash
# API Backend
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ssas-activity
PORT=3000

# Frontend
NEXT_PUBLIC_API_URL=https://api.ssas-activity.com

# MCP
SSAS_API_URL=https://api.ssas-activity.com
```

## 📊 Flujo de Trabajo con IA

```mermaid
sequenceDiagram
    participant WA as WhatsApp
    participant N8N as N8N Workflow
    participant MCP as MCP Server
    participant API as SSAS API
    participant DB as MongoDB

    WA->>N8N: Mensaje "¿Qué actividades tengo?"
    N8N->>MCP: get_pending_activities_by_phone
    MCP->>API: POST /auth/phone-login
    API->>DB: Buscar usuario por teléfono
    DB-->>API: Usuario encontrado
    API-->>MCP: Token JWT + datos usuario
    MCP->>API: GET /activities/pending
    API->>DB: Consultar actividades (populate)
    DB-->>API: Actividades con relaciones
    API-->>MCP: Lista de actividades
    MCP-->>N8N: Respuesta formateada
    N8N->>WA: "Tienes 3 actividades pendientes..."
```

## 👥 Roles y Permisos

| Rol | Empresas | Usuarios | Actividades | Reportes |
|-----|----------|----------|-------------|----------|
| **Super Admin** | ✅ CRUD | ✅ CRUD Global | ✅ CRUD Global | ✅ Global |
| **Company Admin** | ❌ Solo su empresa | ✅ CRUD Empresa | ✅ CRUD Empresa | ✅ Empresa |
| **Operator** | ❌ Solo lectura | ✅ Solo lectura | ✅ CRUD Asignadas | ✅ Empresa |
| **User** | ❌ Solo lectura | ❌ Solo perfil | ✅ CRUD Propias | ❌ No |

## 🧪 Testing

### API Backend
```bash
cd ssas-activity-api
npm test
npm run test:coverage
```

### Frontend
```bash
cd saas-activity-platform
npm test
npm run test:e2e
```

### MCP Server
```bash
cd mcp-activity
npm test
npm run test:integration
```

## 📦 Deployment

### Docker Compose (Recomendado)

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  api:
    build: ./ssas-activity-api
    ports:
      - "3000:3000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/ssas-activity
    depends_on:
      - mongodb

  frontend:
    build: ./saas-activity-platform
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3000

volumes:
  mongodb_data:
```

### Despliegue Individual

#### API (Backend)
```bash
cd ssas-activity-api
npm run build
npm start
```

#### Frontend
```bash
cd saas-activity-platform
npm run build
npm start
```

#### MCP Server
```bash
cd mcp-activity
npm run build
npm start
```

## 🔗 Integraciones

### WhatsApp + N8N + IA
1. **WhatsApp Evolution API** recibe mensajes
2. **N8N** procesa y rutea automáticamente
3. **MCP Server** conecta con Claude/ChatGPT
4. **SSAS API** maneja datos y lógica de negocio
5. **Respuesta inteligente** vía WhatsApp

### APIs Externas Soportadas
- **WhatsApp Evolution API** - Mensajería
- **Claude/ChatGPT API** - IA Conversacional
- **N8N Webhooks** - Automatización
- **MongoDB Atlas** - Base de datos cloud

## 📈 Roadmap

### Versión 1.1 (Q2 2025)
- [ ] Notificaciones push
- [ ] Reportes avanzados
- [ ] API de webhooks
- [ ] Integración con calendarios

### Versión 1.2 (Q3 2025)
- [ ] App móvil (React Native)
- [ ] Integración con Slack/Teams
- [ ] IA predictiva para asignaciones
- [ ] Dashboard analítico avanzado

### Versión 2.0 (Q4 2025)
- [ ] Microservicios
- [ ] Kubernetes deployment
- [ ] API GraphQL
- [ ] Multi-idioma (i18n)

## 🤝 Contribución

1. **Fork** el repositorio
2. **Crear rama** para tu feature (`git checkout -b feature/amazing-feature`)
3. **Commit** cambios (`git commit -m 'Add amazing feature'`)
4. **Push** a la rama (`git push origin feature/amazing-feature`)
5. **Crear Pull Request**

### Convenciones
- **Commits**: Usar [Conventional Commits](https://conventionalcommits.org/)
- **Branches**: `feature/`, `bugfix/`, `hotfix/`
- **Testing**: Incluir tests para nuevas funcionalidades
- **Documentación**: Actualizar README correspondiente

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT** - ver [LICENSE](LICENSE) para detalles.

## 📞 Soporte y Contacto

- **Email**: [soporte@ssas-activity.com](mailto:soporte@ssas-activity.com)
- **Documentación**: [docs.ssas-activity.com](https://docs.ssas-activity.com)
- **Issues**: [GitHub Issues](https://github.com/luisvasquezdelaguila/ssas-activity/issues)
- **Discord**: [Comunidad SSAS](https://discord.gg/ssas-activity)

## 🏆 Créditos

**Desarrollado por**: [Luis Vásquez de la Águila](https://github.com/luisvasquezdelaguila)

**Tecnologías utilizadas**:
- [Next.js](https://nextjs.org/) - Framework React
- [MongoDB](https://mongodb.com/) - Base de datos
- [Model Context Protocol](https://modelcontextprotocol.io/) - Integración IA
- [N8N](https://n8n.io/) - Automatización
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI

---

<div align="center">

**🚀 SSAS Activity Platform - Gestión inteligente de actividades empresariales**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://mongodb.com/)

</div>
