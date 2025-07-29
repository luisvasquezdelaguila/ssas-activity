// Variables de configuración de base de datos
// dotenv ya se configura en index.ts
export const MONGO_URI = process.env.MONGO_URI || '';
export const DB_NAME = process.env.MONGO_DATABASE || 'ssas-activity';
