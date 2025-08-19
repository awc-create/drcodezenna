import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
const RESEND_FROM_ENV = process.env.RESEND_FROM ?? 'Dr. Odera Ezenna <news@drcodezenna.com>';

export const RESEND_ENABLED = Boolean(RESEND_API_KEY);
export const RESEND_FROM = RESEND_FROM_ENV;

export const resend = RESEND_ENABLED ? new Resend(RESEND_API_KEY) : undefined;

if (!RESEND_ENABLED) {
  console.warn('[resend] RESEND_API_KEY not set. Email features are disabled.');
}
