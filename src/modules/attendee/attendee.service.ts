import { Injectable, Inject, BadRequestException, OnModuleInit } from '@nestjs/common';
import { DATABASE_CONNECTION, ATTENDEE_REPOSITORY } from '../../config/constants';
import { AttendeeEntity } from 'src/entities';
import { AttendeeDto, UpdateAttendeeDto } from './dto/attendee.dto';
import { ILike, QueryFailedError } from 'typeorm';

@Injectable()
export class AttendeeService {
  constructor(
    @Inject(ATTENDEE_REPOSITORY)
    private attendeeRepository: typeof AttendeeEntity,
  ) { }

  async getAllAttendeesRegisteredForMultipleEvents(pagination, filters) {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 50;
      const offset = (page - 1) * limit;
      let whereClause = '';
      let parameters: any[] = [];

      if (filters?.search) {
        whereClause = `WHERE (a.name ILIKE $1 OR a.email ILIKE $2)`;
        parameters.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      const attendeesQuery = `
        SELECT a.*, CAST(COUNT(r.id) AS INTEGER) AS event_count
        FROM attendee a
        LEFT JOIN registration r ON a.id = r.attendee_id
        LEFT JOIN event e ON r.event_id = e.id
        ${whereClause}
        GROUP BY a.id
        HAVING COUNT(r.id) > 1  -- Only attendees who have registered for more than 1 event
        ORDER BY event_count DESC
        LIMIT $${parameters.length + 1} OFFSET $${parameters.length + 2}
      `;

      // Query to count the total number of attendees (without pagination)
      const countQuery = `
        SELECT CAST(COUNT(DISTINCT a.id) AS INTEGER) AS count
        FROM attendee a
        LEFT JOIN registration r ON a.id = r.attendee_id
        LEFT JOIN event e ON r.event_id = e.id
        ${whereClause}
      `;

      parameters.push(limit, offset);

      const attendees = await this.attendeeRepository.query(attendeesQuery, parameters);

      const countResult = await this.attendeeRepository.query(countQuery, parameters.slice(0, filters?.search ? 2 : 0));

      const totalCount = countResult[0]?.count || 0;

      return {
        attendees,
        pagination: {
          currentCount: attendees.length,
          totalCount: totalCount,
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }


  async getAllAttendees(pagination, filters) {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 50;
      const offset = (page - 1) * limit;
      let whereClause: any = {};

      if (filters?.search) {
        whereClause =
        {
          name: ILike(`%${filters.search}%`),
          email: ILike(`%${filters.search}%`)
        };
      }

      const [rows, count] = await this.attendeeRepository.findAndCount({
        where: { ...whereClause },
        take: limit,
        skip: offset,
      });


      return {
        attendees: rows,
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

  async getOneAttendee(attendee_id) {
    try {
      const attendee = await this.attendeeRepository.findOne({
        where: { id: attendee_id },
      });

      return {
        attendee
      };
    } catch (error) {
      throw error;
    }
  }

  async createAttendee(attendeeDto: AttendeeDto) {
    try {
      const attendee = await this.attendeeRepository.insert({
        ...attendeeDto,
      });

      return attendee.generatedMaps[0];
    } catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('duplicate key value violates unique constraint') && error.driverError.detail.includes('email')) {
        throw new BadRequestException("An attendee is already registered with this email!")
      }
      throw error;
    }
  }

  async updateAttendee(attendee_id: string, updateAttendeeDto: UpdateAttendeeDto) {
    try {
      await this.attendeeRepository.update(attendee_id, updateAttendeeDto);

      const updatedAttendee = await this.attendeeRepository.findOne({ where: { id: attendee_id } });

      return updatedAttendee;
    } catch (error) {
      throw error;
    }
  }


  async deleteAttendee(attendee_id: string) {
    try {
      const attendee = await this.attendeeRepository.findOne({ where: { id: attendee_id } });

      if (!attendee) {
        throw new Error('Attendee not found!');
      }

      return await this.attendeeRepository.remove(attendee);
    } catch (error) {
      throw error;
    }
  }

}
