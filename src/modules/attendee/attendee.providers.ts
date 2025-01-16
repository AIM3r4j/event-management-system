import {
  AttendeeEntity,
} from '../../entities';
import {
  ATTENDEE_REPOSITORY,
} from '../../config/constants';

export const attendeeProviders = [
  {
    provide: ATTENDEE_REPOSITORY,
    useValue: AttendeeEntity,
  },
];
