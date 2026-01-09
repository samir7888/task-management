import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processsor';
import { EMAIL_QUEUE } from './email.queue';

@Module({
    imports: [
        BullModule.registerQueue({
            name: EMAIL_QUEUE,
        }),
    ],
    providers: [EmailProcessor, EmailService],
    exports: [EmailService, BullModule],
})
export class EmailModule { }
