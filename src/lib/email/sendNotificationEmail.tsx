// src/lib/email/sendNotificationEmail.tsx
'use server';

import * as React from 'react';
import { resend } from '../resend';
import NewPostEmail from '@/emails/NewPostEmail';

type PostType = 'Blog' | 'Teaching';

type Params = {
  to: string[];                 // recipients (batched)
  subject: string;
  postTitle: string;
  postType: PostType;
  postUrl: string;
};

type SendResult =
  | { skipped: true }
  | { data: unknown }
  | { error: string };

const FROM = process.env.RESEND_FROM ?? 'news@drcodezenna.com';
const REPLY_TO = process.env.RESEND_REPLY_TO ?? undefined;
const BATCH_SIZE = 50;

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Single post notification email (kept for compatibility with cron routes).
 * Safe to keep even if you don’t actively use it.
 */
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

    const recipients = Array.from(new Set(to)); // dedupe
    const batches = chunk(recipients, BATCH_SIZE);
    const results: unknown[] = [];

    for (const batch of batches) {
      const raw = await resend.emails.send({
        from: FROM,           // e.g. 'Dr. Odera Ezenna <news@drcodezenna.com>'
        to: batch,
        subject,
        react: (
          <NewPostEmail
            postTitle={postTitle}
            postType={postType}
            postUrl={postUrl}
          />
        ),
        replyTo: REPLY_TO,    // ✅ correct key (fixes your TS error)
      });

      results.push(raw);
    }

    return { data: results };
  } catch (err) {
    console.error('Email failed:', err);
    return { error: 'Send failed' };
  }
}
