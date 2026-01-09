import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EMAIL_QUEUE, SEND_INVITE_EMAIL } from './email.queue';
import { EmailService } from './email.service';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
    constructor(private readonly emailService: EmailService) {
        super();
    }

    async process(job: Job) {
        if (job.name === SEND_INVITE_EMAIL) {
            const { email, token } = job.data;

            try {
                await this.emailService.sendInviteEmail(email, token);
            } catch (error) {
                console.error(`Failed to send email to ${email}:`, error);
                throw error;
            }
        }
    }
}
