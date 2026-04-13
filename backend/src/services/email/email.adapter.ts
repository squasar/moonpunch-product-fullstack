/**
 * Email Adapter Interface
 * Implement this interface for any email provider.
 */
export interface EmailAdapter {
  send(options: EmailOptions): Promise<void>;
}

export interface EmailOptions {
  to:      string;
  subject: string;
  html:    string;
  text?:   string;
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export const templates = {
  verifyEmail: (verifyUrl: string): Pick<EmailOptions, 'subject' | 'html' | 'text'> => ({
    subject: 'Verify your MOON PUNCH account',
    html: `
      <div style="font-family:Montserrat,sans-serif;background:#111417;color:#fff;padding:40px;border-radius:12px;">
        <img src="https://moonpunch.com/assets/img/mp-turuncu.png" width="140" />
        <h2 style="color:#ff4500;margin-top:24px;">Verify your email</h2>
        <p>Click the button below to verify your email address and activate your account.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#ff4500;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px;">
          Verify Email
        </a>
        <p style="color:#6c757d;margin-top:24px;font-size:12px;">If you did not create this account, you can safely ignore this email.</p>
      </div>`,
    text: `Verify your MOON PUNCH account: ${verifyUrl}`,
  }),

  resetPassword: (resetUrl: string): Pick<EmailOptions, 'subject' | 'html' | 'text'> => ({
    subject: 'Reset your MOON PUNCH password',
    html: `
      <div style="font-family:Montserrat,sans-serif;background:#111417;color:#fff;padding:40px;border-radius:12px;">
        <img src="https://moonpunch.com/assets/img/mp-turuncu.png" width="140" />
        <h2 style="color:#ff4500;margin-top:24px;">Password Reset</h2>
        <p>We received a request to reset your password. Click below to proceed.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#ff4500;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px;">
          Reset Password
        </a>
        <p style="color:#6c757d;margin-top:24px;font-size:12px;">This link expires in 1 hour. If you did not request this, ignore this email.</p>
      </div>`,
    text: `Reset your MOON PUNCH password: ${resetUrl}`,
  }),
};
