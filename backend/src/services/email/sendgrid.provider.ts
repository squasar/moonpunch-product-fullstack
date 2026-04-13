import { EmailAdapter, EmailOptions } from './email.adapter';
import { env } from '../../config/env';

/**
 * SendGrid Email Provider
 * Set EMAIL_PROVIDER=sendgrid in .env and provide SENDGRID_API_KEY.
 * Install: npm install @sendgrid/mail
 */
export class SendGridProvider implements EmailAdapter {
  async send(options: EmailOptions): Promise<void> {
    // Dynamic import keeps the dependency optional
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(env.SENDGRID_API_KEY);

    await sgMail.send({
      from:    env.FROM_EMAIL,
      to:      options.to,
      subject: options.subject,
      html:    options.html,
      text:    options.text,
    });
  }
}
