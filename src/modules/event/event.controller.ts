import {
  Controller,
  Request,
  Post,
  Body,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  Patch,
  UnauthorizedException,
  ForbiddenException,
  Sse,
  MessageEvent,
  ParseBoolPipe,
  Delete,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { EventService } from './event.service';
import { EventDto, UpdateEventDto } from './dto/event.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { map, Observable } from 'rxjs';

@ApiTags('Events')
@Controller('v1/event')
export class EventControllerV1 {
  constructor(
    private eventService: EventService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async clearEventsAllCacheKey() {
    // Invalidate cache for event listing
    try {
      // Manually delete matching keys
      const allKeys = await this.cacheManager.store.keys();
      const keysToDelete = allKeys.filter(key => key.startsWith('event:all:'));
      for (const key of keysToDelete) {
        await this.cacheManager.del(key);
      }
    } catch (err) {
      console.error('Cache invalidation error:', err);
    }
  }

  @Sse('notification')
  @ApiOperation({ summary: 'Receive real-time notifications' })
  @ApiResponse({
    status: 200,
    description: 'Real-time notifications',
    content: {
      'text/event-stream': {
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Notification title' },
            body: { type: 'string', description: 'Notification body' },
          },
        },
      },
    },
  })
  streamNotifications(): Observable<MessageEvent> {
    // Listen to the notificationSubject for new notifications
    return this.eventService.notifications$.pipe(
      map((notification) => ({ data: notification } as MessageEvent))
    );
  }

  @Get('most-registrations')
  @ApiOperation({ summary: 'Get all events with most registrations' })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Number of events per page' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Date filter for events (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: "The request has succeeded",
  })
  async getAllEventsWithMostRegistrations(@Query('page') page?: string, @Query('limit') limit?: string, @Query('date') date?: string) {
    // Validate the date format
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException("Invalid date format. Expected format is 'YYYY-MM-DD'.");
    }

    const cacheKey = `event:all:most-registrations:${page}:${limit}:${date}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const events = await this.eventService.getAllEventsWithMostRegistrations({ page, limit }, { date });
    await this.cacheManager.set(cacheKey, events);
    return events;
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Number of events per page' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Date filter for events (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: "The request has succeeded",
  })
  async getAllEvents(@Query('page') page?: string, @Query('limit') limit?: string, @Query('date') date?: string) {
    // Validate the date format
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException("Invalid date format. Expected format is 'YYYY-MM-DD'.");
    }

    const cacheKey = `event:all:${page}:${limit}:${date}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const events = await this.eventService.getAllEvents({ page, limit }, { date });
    await this.cacheManager.set(cacheKey, events);
    return events;
  }

  @Get(':event_id')
  @ApiOperation({ summary: 'Get a specific event by ID' })
  @ApiParam({ name: 'event_id', type: String, description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: "The request has succeeded",
  })
  @ApiResponse({
    status: 400,
    description: 'Event not found!',
  })
  async getOneEvent(
    @Param('event_id', ParseUUIDPipe) event_id: string,
  ) {
    const cacheKey = `event:${event_id}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const event = await this.eventService.getOneEvent(event_id);
    await this.cacheManager.set(cacheKey, event);
    return event
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({
    status: 201,
    description: "The request has succeeded",
  })
  async createEvent(
    @Body() event: EventDto,
  ) {
    const createdEvent = await this.eventService.createEvent(event);

    await this.clearEventsAllCacheKey();

    return createdEvent;
  }

  @Post(':event_id/register/:attendee_id')
  @ApiOperation({ summary: 'Register an attendee for an event' })
  @ApiParam({ name: 'event_id', type: String, description: 'Event UUID' })
  @ApiParam({ name: 'attendee_id', type: String, description: 'Attendee UUID' })
  @ApiResponse({
    status: 200,
    description: "The request has succeeded",
  })
  @ApiResponse({
    status: 400,
    description: 'Event not found!',
  })
  @ApiResponse({
    status: 400,
    description: 'Attendee not found!',
  })
  async registerAttendee(
    @Param('event_id', ParseUUIDPipe) event_id: string,
    @Param('attendee_id', ParseUUIDPipe) attendee_id: string,
  ) {
    await this.cacheManager.reset();
    const registration = await this.eventService.registerAttendee(event_id, attendee_id);

    await this.cacheManager.del(`event:${event_id}`);

    return registration;
  }

  @Delete('unregister/:registration_id')
  @ApiOperation({ summary: 'Unregister an attendee from an event' })
  @ApiParam({ name: 'registration_id', type: String, description: 'Registration UUID' })
  @ApiResponse({
    status: 200,
    description: "The request has succeeded",
  })
  @ApiResponse({
    status: 400,
    description: 'Registration not found!',
  })
  async unregisterAttendee(
    @Param('registration_id', ParseUUIDPipe) registration_id: string,
  ) {
    const registration = await this.eventService.unregisterAttendee(registration_id);

    const event_id = registration.event.id
    await this.cacheManager.del(`event:${event_id}`);

    return registration;
  }

  @Patch(':event_id')
  @ApiOperation({ summary: 'Update event details' })
  @ApiParam({ name: 'event_id', type: String, description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: "The request has succeeded",
  })
  async updateEvent(
    @Param('event_id', ParseUUIDPipe) event_id: string,
    @Body() reqbody: UpdateEventDto,
  ) {
    const updatedEvent = await this.eventService.updateEvent(event_id, reqbody);

    await this.cacheManager.del(`event:${event_id}`);
    await this.clearEventsAllCacheKey();

    return updatedEvent;
  }

  @Delete(':event_id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiParam({ name: 'event_id', type: String, description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: "The request has succeeded",
  })
  async deleteEvent(
    @Param('event_id', ParseUUIDPipe) event_id: string,
  ) {
    const deletedEvent = await this.eventService.deleteEvent(event_id);

    await this.cacheManager.del(`event:${event_id}`);
    await this.clearEventsAllCacheKey();

    return deletedEvent;
  }
}
