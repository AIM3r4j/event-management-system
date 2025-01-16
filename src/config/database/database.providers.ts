import { DataSource } from 'typeorm';
import {
  DEVELOPMENT,
  TEST,
  PRODUCTION,
  DATABASE_CONNECTION,
} from '../constants';
import { databaseConfig } from './database.config';
import * as entities from '../../entities';
import { Logger } from '../logger';

export const databaseProviders = [
  {
    name: DATABASE_CONNECTION,
    provide: DATABASE_CONNECTION,
    useFactory: async () => {
      let config;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.development;
          break;
        case TEST:
          config = databaseConfig.test;
          break;
        case PRODUCTION:
          config = databaseConfig.production;
          break;
        default:
          config = databaseConfig.development;
      }

      const dataSource = new DataSource({
        ...config,
        entities: Object.values(entities), // Load all entities
      });

      try {
        // Ensure the connection is established before continuing
        await dataSource.initialize();

        const loggingdata = {
          HOST: config.host,
          PORT: config.port,
        };
        Logger.log(
          'info',
          `${config.database} ${JSON.stringify(loggingdata, null, 4)} CONNECTED!`,
          { label: 'Database' },
        );
      } catch (err) {
        const loggingdata = {
          HOST: config.host,
          PORT: config.port,
        };
        Logger.log(
          'error',
          `${config.database} ${JSON.stringify(loggingdata, null, 4)} Failed To Connect! \nReason: ${err.message}`,
          { label: 'Database' },
        );
        // If the connection fails, exit the process
        process.exit(1);
      }

      return dataSource;
    },
  },
];
