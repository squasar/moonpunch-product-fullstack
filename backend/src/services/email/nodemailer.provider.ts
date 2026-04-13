import nodemailer from 'nodemailer';
import { EmailAdapter, EmailOptions } from './email.adapter';
import { env } from '../../config/env';

export class NodemailerProvider implements EmailAdapter {
  private transporter = nodemailer.createTransport({
    host:   env.SMTP_HOST ?? 'smtp.gmail.com',
    port:   parseInt(env.SMTP_PORT ?? '587'),
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  async send(options: EmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from:    `"MOON PUNCH" <${env.FROM_EMAIL}>`,
      to:      options.to,
      subject: options.subject,
      html:    options.html,
      text:    options.text,
    });
  }
}
