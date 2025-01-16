import { Injectable, Inject, BadRequestException, OnModuleInit } from '@nestjs/common';
import { EventDto, NotificationDto, UpdateEventDto } from './dto/event.dto';
import { DATABASE_CONNECTION, ATTENDEE_REPOSITORY, EVENT_REPOSITORY, REGISTRATION_REPOSITORY, QUEUE_NAME } from 'src/config/constants';
import { AttendeeEntity, EventEntity, RegistrationEntity } from 'src/entities';
import { Subject } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class EventService {
  readonly notifications$ = new Subject<any>();

  constructor(
    @Inject(ATTENDEE_REPOSITORY)
    private attendeeRepository: typeof AttendeeEntity,
    @Inject(EVENT_REPOSITORY)
    private eventRepository: typeof EventEntity,
    @Inject(REGISTRATION_REPOSITORY)
    private registrationRepository: typeof RegistrationEntity,
    @InjectQueue(QUEUE_NAME) private queue: Queue
  ) { }

  sendNotification(notification: NotificationDto) {
    this.notifications$.next(notification);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async runScheduler() {
    try {
      console.log("info", "Running reminder processor scheduler every day at 1AM")
      await this.sendRemindersToAttendees1DayBeforeEvent();
    } catch (error) {
      throw error;
    }
  }

  async sendRemindersToAttendees1DayBeforeEvent() {
    try {
      const [events, totalCount] = await this.eventRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.registrations', 'registration')
        .leftJoinAndSelect('registration.attendee', 'attendee')
        .where('event.date = DATE(CURRENT_DATE) + INTERVAL \'1 day\'')
        .getManyAndCount();

      for (let event of events) {
        for (let registration of event.registrations) {
          // add to queue for sending reminder mail
          const sendReminderQueue = await this.queue.add(QUEUE_NAME, {
            type: "reminder",
            event,
            registration
          }, { attempts: 3, removeOnComplete: true })
        }
      }

    } catch (error) {
      throw error;
    }
  }

  async getAllEventsWithMostRegistrations(pagination, filters) {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 50;
      const offset = (page - 1) * limit;
      let whereClause = '';
      let parameters: any[] = [];

      if (filters?.date) {
        whereClause = `WHERE e.date = ?`;
        parameters.push(filters.date);
      }

      const eventsQuery = `
        SELECT e.*, CAST(COUNT(r.id) AS INTEGER) AS registrations_count
        FROM event e
        LEFT JOIN registration r ON e.id = r.event_id
        ${whereClause}
        GROUP BY e.id
        ORDER BY registrations_count DESC, e.created_at DESC
        LIMIT $1 OFFSET $2  -- Use $1 and $2 for LIMIT and OFFSET
      `;

      // Raw query to count total events (needed for pagination) 
      const countQuery = `
        SELECT CAST(COUNT(DISTINCT e.id) AS INTEGER) AS count
        FROM event e
        LEFT JOIN registration r ON e.id = r.event_id
        ${whereClause}
      `;

      parameters.push(limit, offset);

      const events = await this.eventRepository.query(eventsQuery, parameters);

      const countResult = await this.eventRepository.query(countQuery, parameters.slice(0, filters?.date ? 1 : 0));

      const count = countResult[0]?.count || 0;

      return {
        events,
        pagination: {
          currentCount: events.length,
          totalCount: count,
          currentPage: Number(page),
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllEvents(pagination, filters) {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 50;
      const offset = (page - 1) * limit;
      let whereClause: any = {};

      if (filters?.date) {
        whereClause['date'] = filters.date
      }

      const [rows, count] = await this.eventRepository.findAndCount({
        where: { ...whereClause },
        order: {
          created_at: 'DESC',
        },
        take: limit,
        skip: offset,
      });

      return {
        events: rows,
        pagination: {
          currentCount: rows.length,
          totalCount: count,
          currentPage: Number(page),
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getOneEvent(event_id) {
    try {
      const event = await this.eventRepository.findOne({
        where: { id: event_id },
        relations: ['registrations', 'registrations.attendee'],
      });

      return {
        event,
      };
    } catch (error) {
      throw error;
    }
  }

  async createEvent(eventDto: EventDto) {
    try {
      const existingEvent = await this.eventRepository.findOne({
        where: { date: new Date(eventDto.date) },
      });

      if (existingEvent) {
        throw new BadRequestException(`An event has already been scheduled on ${eventDto.date}!`);
      }

      const event = await this.eventRepository.insert({
        ...eventDto,
      });

      // send real-time notification for the new event creation
      this.sendNotification({
        title: "New Event just got scheduled!",
        body: `"${event.generatedMaps[0].name}" event scheduled on ${event.generatedMaps[0].date}`
      })

      return event.generatedMaps[0];
    } catch (error) {
      throw error;
    }
  }

  async updateEvent(event_id: string, updateEventDto: UpdateEventDto) {
    try {
      await this.eventRepository.update(event_id, updateEventDto);

      return await this.eventRepository.findOne({
        where: { id: event_id },
      });
    } catch (error) {
      throw error;
    }
  }


  async deleteEvent(event_id: string) {
    try {
      const event = await this.eventRepository.findOne({
        where: { id: event_id },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      return await this.eventRepository.remove(event);
    } catch (error) {
      throw error;
    }
  }

  async registerAttendee(event_id, attendee_id) {
    try {
      const event = await this.eventRepository.findOne({
        where: { id: event_id },
        relations: ['registrations'],
      });

      if (!event) {
        throw new BadRequestException("Event not found!")
      }

      const currentRegistrationsCount = event.registrations.length;

      if (currentRegistrationsCount >= event.max_attendees) {
        throw new BadRequestException("No more seats available for this event!");
      }

      const attendee = await this.attendeeRepository.findOne({
        where: { id: attendee_id }
      });

      if (!attendee) {
        throw new BadRequestException("Attendee not found!")
      }

      const existingRegistration = await this.registrationRepository.findOne({
        where: { event: { id: event.id }, attendee: { id: attendee.id } },
      });

      if (existingRegistration) {
        throw new BadRequestException("Attendee is already registered for this event!");
      }

      const registration = await this.registrationRepository.insert({
        event,
        attendee,
      });

      const registrationWithRelations = await this.registrationRepository.findOne({
        where: { id: registration.identifiers[0].id },
        relations: ['attendee'],
      });

      // add to queue for sending registration confirmation mail
      const sendRegistrationConfirmationQueue = await this.queue.add(QUEUE_NAME, {
        type: 'register',
        event,
        registration: registrationWithRelations
      }, { attempts: 3, removeOnComplete: true })

      // send real-time notification when only 2 seats are left for the event
      if ((currentRegistrationsCount - 1) === 2) {
        this.sendNotification({
          title: "Event seats are about to get filled up!",
          body: "Only 2 seats remaining, grab one before all seats get booked!"
        })
      }

      return {
        registration: registration.generatedMaps[0]
      };
    } catch (error) {
      throw error;
    }
  }

  async unregisterAttendee(registration_id) {
    try {
      const registration = await this.registrationRepository.findOne({
        where: { id: registration_id },
        relations: ['event'],
      });

      if (!registration) {
        throw new BadRequestException("Registration not found!")
      }

      await registration.remove();

      return registration
    } catch (error) {
      throw error;
    }
  }
}
