import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { EventEntity } from './event.entity';
import { AttendeeEntity } from './attendee.entity';

@Entity('registration')
export class RegistrationEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EventEntity, (event) => event.registrations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @ManyToOne(() => AttendeeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendee_id' })
  attendee: AttendeeEntity;

  @CreateDateColumn({ type: 'timestamp' })
  registered_at: Date;
}
