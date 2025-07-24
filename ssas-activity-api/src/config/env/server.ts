import dotenv from 'dotenv';
dotenv.config();


const appConfig = {
    port: parseInt(process.env.APP_PORT || '3000', 10),
    debug: process.env.APP_DEBUG === 'true',
    timezone: 'America/Lima',
    appwebUrl: process.env.APP_WEB_URL || 'http://localhost:4200',
    appPath: process.env.APP_PATH || 'http://localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
}

export default appConfig;