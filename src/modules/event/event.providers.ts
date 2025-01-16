import { ATTENDEE_REPOSITORY, EVENT_REPOSITORY, REGISTRATION_REPOSITORY } from "src/config/constants";
import { AttendeeEntity, EventEntity, RegistrationEntity } from "src/entities";

export const eventProviders = [
  {
    provide: ATTENDEE_REPOSITORY,
    useValue: AttendeeEntity,
  },
  {
    provide: EVENT_REPOSITORY,
    useValue: EventEntity,
  },
  {
    provide: REGISTRATION_REPOSITORY,
    useValue: RegistrationEntity,
  },
];
