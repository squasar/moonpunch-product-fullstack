import crypto from 'crypto';

/**
 * Generates a formatted license key like: MPNCH-XXXXX-XXXXX-XXXXX-XXXXX
 */
export function generateLicenseKey(): string {
  const segments = Array.from({ length: 4 }, () =>
    crypto.randomBytes(3).toString('hex').toUpperCase()
  );
  return `MPNCH-${segments.join('-')}`;
}
