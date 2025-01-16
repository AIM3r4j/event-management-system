import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsDateString,
  Min
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EventDto {
  @ApiProperty({
    description: 'The name of the event',
    example: 'Tech Conference 2024',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the event',
    example: 'A conference about the latest trends in technology.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The date of the event (YYYY-MM-DD format)',
    example: '2024-12-31',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Location of the event',
    example: 'Tech Arena, New York',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Maximum number of attendees allowed for the event',
    example: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  max_attendees: number;
}

export class UpdateEventDto {
  @ApiProperty({
    description: 'The name of the event',
    example: 'Tech Conference 2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Description of the event',
    example: 'A conference about the latest trends in technology.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The date of the event (YYYY-MM-DD format)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: 'Location of the event',
    example: 'Tech Arena, New York',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Maximum number of attendees allowed for the event',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_attendees?: number;
}

export class NotificationDto {
  @ApiProperty({ description: 'The notification title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The notification body' })
  @IsNotEmpty()
  @IsString()
  body: string;
}