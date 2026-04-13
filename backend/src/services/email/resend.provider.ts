import { EmailAdapter, EmailOptions } from './email.adapter';
import { env } from '../../config/env';

/**
 * Resend Email Provider
 * Set EMAIL_PROVIDER=resend in .env and provide RESEND_API_KEY.
 * Install: npm install resend
 */
export class ResendProvider implements EmailAdapter {
  async send(options: EmailOptions): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Resend } = require('resend');
    const resend = new Resend(env.RESEND_API_KEY);

    await resend.emails.send({
      from:    `MOON PUNCH <${env.FROM_EMAIL}>`,
      to:      options.to,
      subject: options.subject,
      html:    options.html,
      text:    options.text,
    });
  }
}
