import { REDIS_CONNECTION } from '../constants';
import { createClient, RedisClientType } from 'redis';
import 'dotenv/config';
import { Logger } from '../logger';

export const redisProviders = [
  {
    name: REDIS_CONNECTION,
    provide: REDIS_CONNECTION,
    useFactory: async () => {
      const REDIS_URL = `redis://:${process.env.REDIS_PASS}@${process.env.REDIS_HOST}:${parseInt(process.env.REDIS_PORT)}`;

      let client: RedisClientType = createClient({ url: REDIS_URL });

      const connectClient = async () => {
        await client.connect();
      };

      client.on('error', async (err) => {
        Logger.log('error', `Redis Client %s`, err, { label: 'Redis' });
        try {
          if (client.isOpen) {
            await client.quit();
          }
        } catch (e) {
          Logger.log('error', `After quit, Redis Client %s`, e, {
            label: 'Redis',
          });
        }
        Logger.log('warn', `Initiating redis reconnection after 5 seconds`, {
          label: 'Redis',
        });
        setTimeout(async () => {
          Logger.log('warn', `Trying to reconnect redis`, { label: 'Redis' });
          try {
            client = createClient({ url: REDIS_URL });
            await client.connect();
            Logger.log('info', `${REDIS_URL} RECONNECTED!`, { label: 'Redis' });
          } catch (reconnectErr) {
            Logger.log('error', `${REDIS_URL} Failed To Reconnect!`, {
              label: 'Redis',
            });
          }
        }, 5000); // Reconnect after 5 seconds = 5000 ms, adjust as needed
      });

      client.on('connect', () =>
        Logger.log('info', `${REDIS_URL} CONNECTED!`, { label: 'Redis' }),
      );
      client.on('idle', () =>
        Logger.log(
          'error',
          `Redis Shutting down due to inactivity for a prolonged period!`,
          { label: 'Redis' },
        ),
      );
      client.on('end', () =>
        Logger.log(
          'error',
          `Redis Shutting down due to a client-initiated shutdown or an unexpected disconnection! This might be okay if you chose not to run it in your dev environment!`,
          { label: 'Redis' },
        ),
      );
      client.on('ready', () =>
        Logger.log('info', `Redis is ready to start processing the queue!`, {
          label: 'Redis',
        }),
      );

      await connectClient();

      const performOperationWithReconnect = async (operation) => {
        try {
          if (!client.isOpen) {
            await connectClient();
          }
          return await operation();
        } catch (err) {
          if (err.code === 'ECONNREFUSED' || err.code === 'NR_CLOSED') {
            Logger.log(
              'error',
              `Redis shut down during operation! Probable cause: ${JSON.stringify(err)}`,
              { label: 'Redis' },
            );
            await client.quit();
            client = createClient({ url: REDIS_URL });
            await connectClient();
            return await operation();
          } else {
            throw err;
          }
        }
      };

      return {
        getClient: () => client,
        get: async (key) =>
          await performOperationWithReconnect(() => client.get(key)),
        set: async (key, value) =>
          await performOperationWithReconnect(() => client.set(key, value)),
        setEx: async (key, time, value) =>
          await performOperationWithReconnect(() =>
            client.setEx(key, time, value),
          ),
        incr: async (key) =>
          await performOperationWithReconnect(() => client.incr(key)),
        ping: async () => await client.ping(),
        // Add other Redis operations as needed
      };
    },
  },
];
