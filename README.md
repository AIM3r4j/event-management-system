## Running the app

- Make sure to install docker locally before anything
- Open a terminal inside the directory, and run the following command:

```bash
$ docker-compose up --build -d
```

- This command will automatically build and run database and the nestjs server
- The app will be running on port 5001

- Finally, open 'http://localhost:5001/eventapi/docs' on browser to use the swagger documentation to test the API endpoints

## What is implemented

- Database Models:
    - Event: Table with fields such as id, name, description, date, location, max_attendees, and created_at.
    - Attendee: Table with fields for id, name, and email (unique).
    - Registration: Table to track registrations with event_id and attendee_id as foreign keys.

- Core Features:
    - Event Management:
        - CRUD operations for events.
        - Ensures max_attendees is a positive integer.
        - Prevents overlapping events by validating the date.

    - Attendee Management:
        - CRUD operations for attendees.
        - Ensures unique email for each attendee.

    - Registration Management:
        - Allows attendee registration for events.
        - Ensures the number of registrations doesn't exceed max_attendees.
        - Prevents duplicate registrations for the same event.
        - Lists all registrations for an event with attendee details.

    - Search and Filters:
        - Filter events by date.
        - Search attendees by name or email.

- Advanced Features:
    - Caching:
        - Redis is used to cache frequently accessed data (e.g., event details, attendee lists) with a TTL policy.
    - Background Jobs:
        - BullJS handles background tasks like sending confirmation emails to attendees after successful registration.
    - Scheduling:
        - Uses @nestjs/schedule to send reminders to attendees 24 hours before an event.
    - Email Notifications:
        - Basic email notifications using Nodemailer for registration confirmations and event reminders.
    - Real-time Updates (SSE):
        - Server-Sent Events (SSE) are implemented to notify attendees when new events are created or when spots are near capacity (e.g., only a few spots left).
    - Database Queries:
        - Raw SQL queries are implemented to:
            - Fetch the event with the most registrations.
            - List attendees who have registered for multiple events.
- API Documentation:
    - Swagger is used for API documentation, accessible at /eventapi/docs on the server.