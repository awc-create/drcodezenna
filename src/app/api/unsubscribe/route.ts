// src/app/api/unsubscribe/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('t');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  try {
    const sub = await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } });
    if (!sub) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    await prisma.subscriber.update({
      where: { id: sub.id },
      data: {
        unsubscribedAt: new Date(),
        interests: [], // stop all mail
      },
    });

    return NextResponse.json({ ok: true, message: 'You have been unsubscribed.' });
  } catch (e) {
    console.error('/api/unsubscribe GET error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const normalized = email.trim().toLowerCase();

    const res = await prisma.subscriber.updateMany({
      where: { email: normalized },
      data: { unsubscribedAt: new Date(), interests: [] },
    });

    return NextResponse.json({
      ok: true,
      message: res.count ? 'You have been unsubscribed.' : 'This email was not subscribed.',
    });
  } catch (e) {
    console.error('/api/unsubscribe POST error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
