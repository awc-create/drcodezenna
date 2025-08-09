// src/app/api/cron/notify-blog/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotificationEmail } from '@/lib/email/sendNotificationEmail';

export async function GET() {
  try {
    const newPosts = await prisma.blogPost.findMany({
      where: { notified: false },
    });

    if (!newPosts.length) {
      return NextResponse.json({ message: 'No new blog posts to notify.' });
    }

    const subscribers = await prisma.subscriber.findMany({
      where: {
        interests: { has: 'Blog' },
      },
    });

    const to = subscribers.map((s) => s.email);

    for (const post of newPosts) {
      await sendNotificationEmail({
        to,
        subject: `New Blog Post: ${post.title}`,
        postTitle: post.title,
        postType: 'Blog',
        postUrl: `https://dr-oderacode.com/blog/${post.id}`, // adjust if using slugs
      });

      await prisma.blogPost.update({
        where: { id: post.id },
        data: { notified: true },
      });
    }

    return NextResponse.json({ message: 'Notifications sent for new blog posts.' });
  } catch (err) {
    console.error('Blog notification failed:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
