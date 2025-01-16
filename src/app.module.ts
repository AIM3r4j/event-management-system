import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database/database.module';
import { LoggerMiddleware, SecurityHeadersMiddleware } from './middleware';

import { interceptorProviders } from './helpers/interceptor';

import { AppControllerV1 } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
import { AttendeeModule } from './modules/attendee/attendee.module';
import { EventModule } from './modules/event/event.module';
import { RedisModule } from './config/redis/redis.module';
import { redisStore } from 'cache-manager-redis-yet';
import { QueueModule } from './modules/queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
          },
          password: process.env.REDIS_PASS,
        });

        return {
          store: store as unknown as CacheStore,
          ttl: 60 * 60000, // 60 minutes in milliseconds
        };
      },
      isGlobal: true,
    }),
    DatabaseModule,
    RedisModule,
    QueueModule,
    AttendeeModule,
    EventModule
  ],
  controllers: [
    AppControllerV1,
  ],
  providers: [
    AppService,
    ...interceptorProviders,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');
  }
}
