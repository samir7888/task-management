import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    async sendInviteEmail(email: string, token: string) {
        const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;
        console.log(`Attempting to send email via nodemailer to ${email}...`);

        await this.transporter.sendMail({
            to: email,
            subject: 'You are invited to join a team',
            html: `
        <p>You have been invited to join a team.</p>
        <p>
          <a href="${inviteLink}">Accept Invite</a>
        </p>
      `,
        });
    }
}
