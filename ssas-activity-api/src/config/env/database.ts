import dotenv from 'dotenv';
dotenv.config();

export const MONGO_URI = process.env.MONGO_URI || '';
export const DB_NAME = process.env.DB_NAME || 'ssas-activity';
