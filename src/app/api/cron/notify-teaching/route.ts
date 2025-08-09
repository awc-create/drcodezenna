// src/app/api/cron/notify-teaching/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotificationEmail } from '@/lib/email/sendNotificationEmail';

export async function GET() {
  try {
    const newLessons = await prisma.teachingPost.findMany({
      where: { notified: false },
    });

    if (!newLessons.length) {
      return NextResponse.json({ message: 'No new teaching posts to notify.' });
    }

    const subscribers = await prisma.subscriber.findMany({
      where: {
        interests: { has: 'Teaching' },
      },
    });

    const to = subscribers.map((s) => s.email);

    for (const post of newLessons) {
      await sendNotificationEmail({
        to,
        subject: `New Teaching Post: ${post.title}`,
        postTitle: post.title,
        postType: 'Teaching',
        postUrl: `https://dr-oderacode.com/teaching/${post.id}`, // adjust if using slugs
      });

      await prisma.teachingPost.update({
        where: { id: post.id },
        data: { notified: true },
      });
    }

    return NextResponse.json({ message: 'Notifications sent for new teaching posts.' });
  } catch (err) {
    console.error('Teaching notification failed:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
