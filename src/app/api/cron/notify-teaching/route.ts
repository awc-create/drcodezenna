// src/app/api/cron/notify-teaching/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotificationEmail } from '@/lib/email/sendNotificationEmail';
import { RESEND_ENABLED } from '@/lib/resend';

export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET || '';

function unauthorized() {
  return new NextResponse('Unauthorized', { status: 401 });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function GET(req: Request) {
  try {
    if (CRON_SECRET) {
      const header = req.headers.get('x-cron-secret');
      if (header !== CRON_SECRET) return unauthorized();
    }

    if (!RESEND_ENABLED) {
      return NextResponse.json(
        { skipped: true, reason: 'Email service not configured' },
        { status: 503 },
      );
    }

    const newLessons = await prisma.teachingPost.findMany({
      where: { notified: false },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    if (newLessons.length === 0) {
      return NextResponse.json({ message: 'No new teaching posts to notify.' });
    }

    const subs = await prisma.subscriber.findMany({
      where: { interests: { has: 'Teaching' } },
      select: { email: true },
    });

    const emails = subs.map(s => s.email);
    const batches = chunk(emails, 50);

    for (const post of newLessons) {
      for (const batch of batches) {
        const result = await sendNotificationEmail({
          to: batch,
          subject: `New Teaching Post: ${post.title}`,
          postTitle: post.title,
          postType: 'Teaching',
          postUrl: `https://dr-oderacode.com/teaching/${post.id}`,
        });

        if (result && 'error' in result && result.error) {
          console.error('Teaching notification send failed for batch');
          continue;
        }
      }

      await prisma.teachingPost.update({
        where: { id: post.id },
        data: { notified: true },
      });
    }

    return NextResponse.json({
      message: 'Notifications processed for new teaching posts.',
      posts: newLessons.length,
      recipients: emails.length,
    });
  } catch (err) {
    console.error('Teaching notification failed:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
