import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { expressBind } from 'i18n-2';
import { localize } from './middleware';
import { ValidateInputPipe } from './middleware/validation.middleware';
import { nestwinstonLog, HttpPortLog } from './config/logger';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fs from 'fs';
import moment from 'moment-timezone';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const NestFactoryOptions = { logger: nestwinstonLog, rawBody: true };

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    NestFactoryOptions,
  );
  // Set the default timezone to UTC globally
  moment.tz.setDefault('UTC');

  // Setting Global Prefix
  app.setGlobalPrefix('eventapi');

  expressBind(app, { locales: ['en'] });

  app.use(localize);

  app.enableCors({
    credentials: true,
  });

  app.use(cookieParser.default());

  app.useGlobalPipes(new ValidateInputPipe());

  // Swagger docs only for development/test
  if (process.env.NODE_ENV != 'production') {
    const config = new DocumentBuilder()
      .setTitle('Event Management System')
      .setDescription('Event Management System')
      .setVersion('1.0')
      .addTag('Event Management System')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('eventapi/docs', app, document);
  }

  await app.listen(process.env.PORT || 3000, () =>
    HttpPortLog(
      process.env.NODE_ENV || 'development',
      process.env.PORT || 3000,
    ),
  );
}

bootstrap();
