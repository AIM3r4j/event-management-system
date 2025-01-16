import { Injectable } from '@nestjs/common';
import fs from 'fs'
import { EmailService } from './email.service';

@Injectable()
export class QueueService {
  constructor(
    private emailService: EmailService,
  ) { }

  async processDynamicEmail(data) {
    const { type, event, registration } = data;

    switch (type) {
      case 'register':
        await this.emailService.sendEventRegistrationConfirmation(event, registration)
        break;
      case 'reminder':
        await this.emailService.sendUpcomingEventReminder(event, registration)
        break;

      default:
        break;
    }


  }
}
