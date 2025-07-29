#!/usr/bin/env node

// src/index.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ApiClient } from './services/api-client';

// Configuración del servidor
const SERVER_NAME = 'ssas-activity-mcp';
const SERVER_VERSION = '1.0.0';

// Inicializar cliente API
const apiBaseURL = process.env.SSAS_API_URL || 'http://localhost:3000';
const apiClient = new ApiClient(apiBaseURL);

// Crear servidor MCP
const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION,
});

// Herramienta combinada: Autenticar y obtener actividades pendientes
server.tool(
  'get_pending_activities_by_phone',
  'Autentica un usuario por teléfono y obtiene sus actividades pendientes con información completa del usuario asignado, creador y empresa',
  {
    phone: z.string().describe('Número de teléfono del usuario con código de país (ej: +51987654321)')
  },
  async ({ phone }) => {
    try {
      // Paso 1: Autenticar
      const authResult = await apiClient.authenticateByPhone(phone);
      
      // Paso 2: Obtener actividades pendientes (ahora incluyen relaciones populadas)
      const activities = await apiClient.getUserPendingActivities(authResult.token);
      
      // Formatear actividades con información rica
      const formattedActivities = activities.map(activity => {
        const assignedTo = typeof activity.assignedTo === 'object' ? activity.assignedTo : { id: activity.assignedTo };
        const createdBy = typeof activity.createdBy === 'object' ? activity.createdBy : { id: activity.createdBy };
        const company = typeof activity.companyId === 'object' ? activity.companyId : { id: activity.companyId };
        
        return {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          status: activity.status,
          assignedTo: {
            id: assignedTo.id,
            name: 'name' in assignedTo ? assignedTo.name : 'Usuario no encontrado',
            email: 'email' in assignedTo ? assignedTo.email : '',
            phone: 'phone' in assignedTo ? assignedTo.phone : ''
          },
          createdBy: {
            id: createdBy.id,
            name: 'name' in createdBy ? createdBy.name : 'Usuario no encontrado',
            email: 'email' in createdBy ? createdBy.email : ''
          },
          company: {
            id: company.id,
            name: 'name' in company ? company.name : 'Empresa no encontrada',
            domain: 'domain' in company ? company.domain : ''
          },
          startTime: activity.startTime,
          endTime: activity.endTime,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt
        };
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              user: authResult.user,
              pendingActivities: formattedActivities,
              summary: {
                totalActivities: activities.length,
                userInfo: `${authResult.user.name} (${authResult.user.email})`,
                companies: [...new Set(formattedActivities.map(a => a.company.name))].filter(name => name !== 'Empresa no encontrada')
              },
              message: `Encontradas ${activities.length} actividades pendientes para ${authResult.user.name}`
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);



// Ejecutar el servidor
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.error(`${SERVER_NAME} v${SERVER_VERSION} running on stdio transport`);
      console.error(`API Base URL: ${apiBaseURL}`);
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Manejar señales de salida
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

await main();