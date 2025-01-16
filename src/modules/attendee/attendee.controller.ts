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
  Sse,
  Delete,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AttendeeService } from './attendee.service';
import { AttendeeDto, UpdateAttendeeDto } from './dto/attendee.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@ApiTags('Attendees')
@Controller('v1/attendee')
export class AttendeeControllerV1 {
  constructor(
    private attendeeService: AttendeeService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async clearAttendeesAllCacheKey() {
    // Invalidate cache for attendee listing
    try {
      // Manually delete matching keys
      const allKeys = await this.cacheManager.store.keys();
      const keysToDelete = allKeys.filter(key => key.startsWith('attendee:all:'));
      for (const key of keysToDelete) {
        await this.cacheManager.del(key);
      }
    } catch (err) {
      console.error('Cache invalidation error:', err);
    }
  }

  @Get('multiple-events')
  @ApiOperation({ summary: 'Get all attendees registered for multiple events' })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Number of attendees per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search filter for attendees' })
  @ApiResponse({
    status: 200,
    description: "The request has succeeded",
  })
  async getAllAttendeesRegisteredForMultipleEvents(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    const cacheKey = `attendee:all:multiple-events:${page}:${limit}:${search}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const attendees = await this.attendeeService.getAllAttendeesRegisteredForMultipleEvents({ page, limit }, { search });
    await this.cacheManager.set(cacheKey, attendees);
    return attendees;
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all attendees' })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Number of attendees per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search filter for attendees' })
  @ApiResponse({
    status: 200,
    description: "The request has succeeded",
  })
  async getAllAttendees(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    const cacheKey = `attendee:all:${page}:${limit}:${search}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const attendees = await this.attendeeService.getAllAttendees({ page, limit }, { search });
    await this.cacheManager.set(cacheKey, attendees);
    return attendees;
  }

  @Get(':attendee_id')
  @ApiOperation({ summary: 'Get a specific attendee by ID' })
  @ApiParam({ name: 'attendee_id', type: String, description: 'Attendee UUID' })
  @ApiResponse({
    status: 200,
    description: "The request has succeeded",
  })
  @ApiResponse({
    status: 400,
    description: 'Attendee not found!',
  })
  async getOneAttendee(
    @Param('attendee_id', ParseUUIDPipe) attendee_id: string,
  ) {
    return await this.attendeeService.getOneAttendee(attendee_id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new attendee' })
  @ApiResponse({
    status: 201,
    description: "The request has succeeded",
  })
  async createAttendee(
    @Body() attendeeDto: AttendeeDto,
  ) {
    const attendee = await this.attendeeService.createAttendee(attendeeDto);

    await this.clearAttendeesAllCacheKey();

    return attendee
  }

  @Patch(':attendee_id')
  @ApiOperation({ summary: 'Update attendee information' })
  @ApiParam({ name: 'attendee_id', type: String, description: 'Attendee UUID' })
  @ApiResponse({
    status: 200,
    description: "The request has succeeded",
  })
  async updateAttendee(
    @Param('attendee_id', ParseUUIDPipe) attendee_id: string,
    @Body() reqbody: UpdateAttendeeDto,
  ) {
    const updatedAttendee = await this.attendeeService.updateAttendee(attendee_id, reqbody);

    await this.clearAttendeesAllCacheKey();

    return updatedAttendee
  }

  @Delete(':attendee_id')
  @ApiOperation({ summary: 'Delete an attendee' })
  @ApiParam({ name: 'attendee_id', type: String, description: 'Attendee UUID' })
  @ApiResponse({
    status: 200,
    description: "The request has succeeded",
  })
  async deleteAttendee(
    @Param('attendee_id', ParseUUIDPipe) attendee_id: string,
  ) {
    const deletedAttendee = await this.attendeeService.deleteAttendee(attendee_id);

    await this.clearAttendeesAllCacheKey();

    return deletedAttendee
  }
}
