// src/shared/seeders/base-seeder.ts

import mongoose from 'mongoose';
import { MONGO_URI, DB_NAME } from '../../config/env/database';

export abstract class BaseSeeder {
  abstract run(): Promise<void>;
  abstract clear(): Promise<void>;

  protected async connectDB() {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI, {
        dbName: DB_NAME
      });
    }
  }

  protected async disconnectDB() {
    await mongoose.disconnect();
  }

  protected log(message: string) {
    console.log(`[${this.constructor.name}] ${message}`);
  }
}
