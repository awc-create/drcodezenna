import * as React from 'react';
import { render } from '@react-email/render';
import { resend } from '@/lib/resend';
import WelcomeEmail from '@/emails/WelcomeEmail';

type Args = { to: string; name?: string };
type Result = { id?: string; skipped?: true };

export async function sendWelcomeEmail({ to, name }: Args): Promise<Result> {
  if (!resend) return { skipped: true };

  const site = process.env.SITE_URL || 'http://localhost:3000';
  const from = process.env.RESEND_FROM || 'Dr. Odera Ezenna <news@drcodezenna.com>';

  const html = await render(
    <WelcomeEmail
      name={name}
      logoUrl={`${site}/assets/drcode-logo.png`}
      unsubscribeUrl={`${site}/unsubscribe`}
    />
  );

  const result = await resend.emails.send({
    from,
    to,
    subject: 'Thanks for subscribing to The Code Times',
    html,
  });

  // New SDK shape: { data?: { id: string } | null, error?: { message: string } | null }
  if (result.error) {
    // Log or throw depending on your preference:
    console.error('[sendWelcomeEmail] Resend error:', result.error);
    return {};
  }

  return { id: result.data?.id };
}
