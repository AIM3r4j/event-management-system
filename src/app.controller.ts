import {
  Controller,
  HttpStatus,
  HttpCode,
  Get,
  Query,
  Post,
  Body,
  Res,
  Put,
  Param,
  Delete,
  Headers,
  Header,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller('v1')
export class AppControllerV1 {
  constructor(private readonly appService: AppService) { }
}
