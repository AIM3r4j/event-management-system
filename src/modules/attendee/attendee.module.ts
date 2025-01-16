import { forwardRef, Module } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { AttendeeControllerV1 } from './attendee.controller';
import { attendeeProviders } from './attendee.providers';
import { DatabaseModule } from '../../config/database/database.module';

@Module({
  providers: [
    AttendeeService,
    ...attendeeProviders,
  ],
  imports: [DatabaseModule],
  exports: [
    AttendeeService,
  ],
  controllers: [
    AttendeeControllerV1,
  ],
})
export class AttendeeModule { }
