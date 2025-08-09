import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type SubscriberPostBody = {
  email?: string;
  name?: string;                 // not nullable in schema
  interests?: string[] | string; // required by schema; we’ll default to []
  location?: string | null;      // optional in schema
};

export async function GET() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { subscribedAt: 'desc' },
  });
  return NextResponse.json(subscribers);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SubscriberPostBody;

    if (!body?.email || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const interests =
      Array.isArray(body.interests)
        ? body.interests
        : typeof body.interests === 'string' && body.interests.length
          ? body.interests.split(',').map(t => t.trim()).filter(Boolean)
          : [];

    const sub = await prisma.subscriber.create({
      data: {
        email: body.email,
        name: body.name ?? '',
        interests,
        location: body.location ?? null,
      },
    });

    return NextResponse.json(sub, { status: 201 });
  } catch (error: unknown) {
    console.error('Failed to create subscriber:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}
