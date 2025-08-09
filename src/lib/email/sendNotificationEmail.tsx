// src/lib/email/sendNotificationEmail.tsx
'use server';

import { resend } from '../resend';
import NewPostEmail from '@/emails/NewPostEmail';

type Params = {
  to: string[];
  subject: string;
  postTitle: string;
  postType: 'Blog' | 'Teaching';
  postUrl: string;
};

type SendResult =
  | { skipped: true }
  | { data: unknown }
  | { error: string };

export async function sendNotificationEmail({
  to,
  subject,
  postTitle,
  postType,
  postUrl,
}: Params): Promise<SendResult> {
  try {
    if (!resend) {
      console.warn('Email skipped: RESEND not configured.');
      return { skipped: true };
    }

    const response = await resend.emails.send({
      from: 'Dr Odera <updates@dr-oderacode.com>',
      to,
      subject,
      react: (
        <NewPostEmail
          postTitle={postTitle}
          postType={postType}
          postUrl={postUrl}
        />
      ),
    });

    if (response.error) {
      console.error('Resend error:', response.error);
      return { error: typeof response.error === 'string' ? response.error : 'Resend send error' };
    }

    return { data: response.data };
  } catch (err) {
    console.error('Email failed:', err);
    return { error: 'Send failed' };
  }
}
