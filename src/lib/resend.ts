import { Resend } from 'resend';

const key = process.env.RESEND_API_KEY;
// Export undefined when missing so imports never throw at module load
export const resend: Resend | undefined = key ? new Resend(key) : undefined;

if (!key) {
  console.warn('[resend] RESEND_API_KEY not set. Emails will be skipped.');
}