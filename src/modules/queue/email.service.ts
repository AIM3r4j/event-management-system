import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { join } from 'path';
import { promises as fs } from 'fs';
import { EventEntity, RegistrationEntity } from 'src/entities';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'placeholder@gmail.com',
                pass: 'placeholder-password',
            },
        });
    }

    async sendEmail(to: string, subject: string, text: string): Promise<any> {
        const mailOptions = {
            from: 'placeholder@gmail.com',
            to,
            subject,
            text,
        };

        console.log(mailOptions)
        return this.transporter.sendMail(mailOptions);
    }

    async sendEventRegistrationConfirmation(event: EventEntity, registration: RegistrationEntity): Promise<any> {
        const subject = "Event Registration Confirmation"
        const text = `Dear Concern, This email is sent to confirm your registration for the following event.:

        Registration ID: ${registration.id}
        Name: ${event.name}
        Description: ${event.description}
        Location: ${event.location}
        Date: ${event.date}`

        return this.sendEmail(registration.attendee.email, subject, text);
    }

    async sendUpcomingEventReminder(event: EventEntity, registration: RegistrationEntity): Promise<any> {
        const subject = "Upcoming Registered Event Reminder"
        const text = `Dear Concern, This email is sent to remind you of an upcoming event you registered for.

        Here are the details: 
        Registration ID: ${registration.id}
        Name: ${event.name}
        Description: ${event.description}
        Location: ${event.location}
        Date: ${event.date}`

        return this.sendEmail(registration.attendee.email, subject, text);
    }

}
