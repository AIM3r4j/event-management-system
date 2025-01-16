import { forwardRef, Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventControllerV1 } from './event.controller';
import { eventProviders } from './event.providers';
import { DatabaseModule } from '../../config/database/database.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  providers: [
    EventService,
    ...eventProviders,
  ],
  imports: [forwardRef(() => QueueModule), DatabaseModule],
  exports: [
    EventService,
  ],
  controllers: [
    EventControllerV1,
  ],
})
export class EventModule { }
