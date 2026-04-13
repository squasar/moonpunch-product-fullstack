import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT:                 z.string().default('3000'),
  NODE_ENV:             z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL:         z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET:    z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET:   z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRY:    z.string().default('15m'),
  JWT_REFRESH_EXPIRY:   z.string().default('7d'),
  // OAuth
  GOOGLE_CLIENT_ID:     z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL:  z.string().optional(),
  GITHUB_CLIENT_ID:     z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL:  z.string().optional(),
  STEAM_API_KEY:        z.string().optional(),
  STEAM_CALLBACK_URL:   z.string().optional(),
  // Email
  EMAIL_PROVIDER:       z.enum(['nodemailer', 'sendgrid', 'resend']).default('nodemailer'),
  SMTP_HOST:            z.string().optional(),
  SMTP_PORT:            z.string().optional(),
  SMTP_USER:            z.string().optional(),
  SMTP_PASS:            z.string().optional(),
  SENDGRID_API_KEY:     z.string().optional(),
  RESEND_API_KEY:       z.string().optional(),
  // App
  FRONTEND_URL:         z.string().default('http://localhost:5500'),
  FROM_EMAIL:           z.string().default('noreply@moonpunch.com'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:\n', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
