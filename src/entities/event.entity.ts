import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { RegistrationEntity } from './registration.entity';

@Entity('event')
export class EventEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: false, unique: true })
  date: Date;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  max_attendees: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => RegistrationEntity, (registration) => registration.event, {
    cascade: true,
  })
  registrations: RegistrationEntity[];
}
