import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AttendeeDto {
  @ApiProperty({
    description: 'The name of the attendee',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The email address of the attendee',
    example: 'johndoe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class UpdateAttendeeDto {
  @ApiProperty({
    description: 'The name of the attendee',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The email address of the attendee',
    example: 'johndoe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
