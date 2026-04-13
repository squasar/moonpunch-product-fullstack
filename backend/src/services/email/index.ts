import { EmailAdapter } from './email.adapter';
import { NodemailerProvider } from './nodemailer.provider';
import { SendGridProvider } from './sendgrid.provider';
import { ResendProvider } from './resend.provider';
import { env } from '../../config/env';

/**
 * Factory that returns the configured email provider.
 * Switch providers by changing EMAIL_PROVIDER in .env — no code changes needed.
 */
function createEmailProvider(): EmailAdapter {
  switch (env.EMAIL_PROVIDER) {
    case 'sendgrid':  return new SendGridProvider();
    case 'resend':    return new ResendProvider();
    case 'nodemailer':
    default:          return new NodemailerProvider();
  }
}

export const emailService: EmailAdapter = createEmailProvider();
export { templates } from './email.adapter';
