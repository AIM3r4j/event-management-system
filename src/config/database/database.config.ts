import { Logger } from '../logger';
import { DataSourceOptions } from 'typeorm';
import 'dotenv/config';

export const databaseConfig: Record<string, DataSourceOptions> = {
  development: {
    type: process.env.DB_DIALECT as any,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_DEVELOPMENT,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    entities: ['dist/**/*.entity{.ts,.js}'], // Path to entities
    synchronize: true, // Automatically sync schema in development
    timezone: process.env.DB_TIMEZONE,
    logging: true,
    extra: {
      connectionTimeoutMillis: 60000,
    },
  },
  test: {
    type: process.env.DB_DIALECT as any,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: false, // Avoid syncing in test environment
    logging: false,
  },
  production: {
    type: process.env.DB_DIALECT as any,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_PRODUCTION,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: false, // Avoid auto-sync in production
    logging: false,
    extra: {
      connectionTimeoutMillis: 60000,
    },
  },
};
