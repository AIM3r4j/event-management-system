// queue.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
import { EmailService } from './email.service';
import { REDIS_CONNECTION, QUEUE_NAME } from '../../config/constants';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        connectionName: REDIS_CONNECTION,
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASS
      }
    }),
    BullModule.registerQueue({ name: QUEUE_NAME }),
  ],
  providers: [QueueService, QueueProcessor, EmailService],
  exports: [BullModule],
})
export class QueueModule { }
