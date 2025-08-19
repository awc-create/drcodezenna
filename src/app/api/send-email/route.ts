import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWeeklyDigestEmail } from '@/lib/email/sendWeeklyDigestEmail';
import { RESEND_ENABLED } from '@/lib/resend';

export const runtime = 'nodejs';

type Interest = 'Blog' | 'Teaching';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const interests: Interest[] = Array.isArray(body?.interests) ? body.interests : [];
    const subject: string = String(body?.subject || '').trim();
    const introMessage: string = String(body?.introMessage || '').trim();
    const periodLabel: string | undefined = body?.periodLabel || undefined;
    const blogIds: string[] = Array.isArray(body?.blogIds) ? body.blogIds : [];
    const teachingIds: string[] = Array.isArray(body?.teachingIds) ? body.teachingIds : [];

    if (!subject) return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    if (!introMessage) return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    if (interests.length === 0) return NextResponse.json({ error: 'Select at least one audience' }, { status: 400 });
    if (blogIds.length === 0 && teachingIds.length === 0) {
      return NextResponse.json({ error: 'Select at least one blog or teaching item' }, { status: 400 });
    }

    // Audience: opted-in + has at least one of the selected interests
    const subs = await prisma.subscriber.findMany({
      where: {
        unsubscribedAt: null,
        interests: { hasSome: interests },
      },
      select: { email: true },
    });

    const to = Array.from(
      new Set(
        subs.map(s => s.email).filter((e): e is string => Boolean(e && e.trim()))
      )
    );

    if (to.length === 0) {
      return NextResponse.json({ error: 'No subscribers match the selected audience' }, { status: 400 });
    }

    // Content lookups
    const [blogs, teachings] = await Promise.all([
      blogIds.length
        ? prisma.blogPost.findMany({ where: { id: { in: blogIds } }, select: { id: true, title: true } })
        : Promise.resolve([] as { id: string; title: string }[]),
      teachingIds.length
        ? prisma.teachingPost.findMany({ where: { id: { in: teachingIds } }, select: { id: true, title: true } })
        : Promise.resolve([] as { id: string; title: string }[]),
    ]);

    const site = process.env.SITE_URL || 'http://localhost:3000';
    const blogItems = blogs.map(b => ({ title: b.title, url: `${site}/blog/${b.id}` }));
    const teachingItems = teachings.map(t => ({ title: t.title, url: `${site}/teaching/${t.id}` }));

    // If email disabled, return a dry-run payload
    if (!RESEND_ENABLED) {
      return NextResponse.json({
        ok: true,
        sent: 0,
        skipped: 'RESEND disabled',
        preview: { toCount: to.length, subject, introMessage, periodLabel, blogItems, teachingItems },
      });
    }

    const result = await sendWeeklyDigestEmail({
      to,
      subject,
      introMessage,
      periodLabel,
      blogPosts: blogItems,
      teachingPosts: teachingItems,
      unsubscribeUrl: `${site}/unsubscribe`,
    });

    if ('error' in result) return NextResponse.json(result, { status: 500 });
    return NextResponse.json({ ok: true, sent: to.length });
  } catch (e) {
    console.error('/api/send-email POST error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
