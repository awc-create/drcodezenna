import * as React from 'react';
import { render } from '@react-email/render';
import { resend, RESEND_FROM } from '@/lib/resend';
import WelcomeEmail from '@/emails/WelcomeEmail';

type Args = { to: string; name?: string; unsubscribeToken?: string };
type Result = { id?: string; skipped?: true };

export async function sendWelcomeEmail({ to, name, unsubscribeToken }: Args): Promise<Result> {
  if (!resend) return { skipped: true };

  const site = process.env.SITE_URL || 'http://localhost:3000';
  const unsubscribeUrl =
    unsubscribeToken
      ? `${site}/unsubscribe?t=${encodeURIComponent(unsubscribeToken)}`
      : `${site}/unsubscribe?email=${encodeURIComponent(to)}`;

  const html = await render(
    <WelcomeEmail
      name={name}
      logoUrl={`${site}/assets/drcode-logo.png`}
      unsubscribeUrl={unsubscribeUrl}
    />
  );

  const result = await resend.emails.send({
    from: RESEND_FROM,
    to,
    subject: 'Thanks for subscribing to The Code Times',
    html,
  });

  if (result.error) {
    console.error('[sendWelcomeEmail] Resend error:', result.error);
    return {};
  }
  return { id: result.data?.id };
}