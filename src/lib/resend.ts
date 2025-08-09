import { Resend } from 'resend';

export const RESEND_ENABLED =
  process.env.RESEND_ENABLED === 'true' && !!process.env.RESEND_API_KEY;

// Nullable client; never throw at module scope
export const resend = RESEND_ENABLED
  ? new Resend(process.env.RESEND_API_KEY as string)
  : null;
