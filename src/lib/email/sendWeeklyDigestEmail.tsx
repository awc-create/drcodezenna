// src/lib/email/sendWeeklyDigestEmail.tsx
'use server';

import * as React from 'react';
import WeeklyDigestEmail, { DigestItem } from '@/emails/WeeklyDigestEmail';
import { resend } from '../resend';

type SendResult = { skipped: true } | { data: unknown } | { error: string };

const FROM = process.env.RESEND_FROM ?? 'news@drcodezenna.com';
const REPLY_TO = process.env.RESEND_REPLY_TO ?? undefined;
const SITE_URL = process.env.SITE_URL ?? 'https://drcodezenna.com';
const BATCH_SIZE = 50;

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function sendWeeklyDigestEmail(params: {
  to: string[];
  subject: string;
  introMessage: string;
  periodLabel?: string;            // e.g., "Week of Sep 1–7" | "September 2025"
  blogPosts?: DigestItem[];
  teachingPosts?: DigestItem[];
  unsubscribeUrl?: string;
}): Promise<SendResult> {
  const {
    to,
    subject,
    introMessage,
    periodLabel,
    blogPosts = [],
    teachingPosts = [],
    unsubscribeUrl,
  } = params;

  try {
    if (!resend) {
      console.warn('[Resend] Skipped: client not configured.');
      return { skipped: true };
    }

    const logoUrl = `${SITE_URL}/assets/drcode-logo.png`;
    const batches = chunk(Array.from(new Set(to)), BATCH_SIZE);
    const results = [];

    for (const batch of batches) {
    const raw = await resend.emails.send({
        from: FROM,
        to: batch,
        subject,
        react: (
        <WeeklyDigestEmail
            logoUrl={logoUrl}
            introMessage={introMessage}
            weekLabel={periodLabel}
            blogPosts={blogPosts}
            teachingPosts={teachingPosts}
            unsubscribeUrl={unsubscribeUrl}
        />
        ),
        replyTo: REPLY_TO, // ✅ correct property name
    });
    results.push(raw);
    }

    return { data: results };

  } catch (err) {
    console.error('Digest email failed:', err);
    return { error: 'Send failed' };
  }
}
