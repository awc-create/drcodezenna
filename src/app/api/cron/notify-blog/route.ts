// src/app/api/cron/notify-blog/route.ts
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
    // Optional: protect the endpoint with a header secret
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

    const newPosts = await prisma.blogPost.findMany({
      where: { notified: false },
      orderBy: { createdAt: 'desc' },
      take: 25, // keep it reasonable
    });

    if (newPosts.length === 0) {
      return NextResponse.json({ message: 'No new blog posts to notify.' });
    }

    const subs = await prisma.subscriber.findMany({
      where: { interests: { has: 'Blog' } },
      select: { email: true },
    });

    const emails = subs.map(s => s.email);
    const batches = chunk(emails, 50); // avoid giant "to:" lists

    for (const post of newPosts) {
      for (const batch of batches) {
        const result = await sendNotificationEmail({
          to: batch,
          subject: `New Blog Post: ${post.title}`,
          postTitle: post.title,
          postType: 'Blog',
          postUrl: `https://dr-oderacode.com/blog/${post.id}`, // swap to slug if you have it
        });

        if (result && 'error' in result && result.error) {
          console.error('Blog notification send failed for batch');
          // Don’t mark as notified; continue next batch/post
          continue;
        }
      }

      // Mark this post as notified only after attempting batches
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { notified: true },
      });
    }

    return NextResponse.json({
      message: 'Notifications processed for new blog posts.',
      posts: newPosts.length,
      recipients: emails.length,
    });
  } catch (err) {
    console.error('Blog notification failed:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
