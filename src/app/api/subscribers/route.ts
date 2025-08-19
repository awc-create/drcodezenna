import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs'; // ✅ Prisma needs Node runtime (not Edge)

type Interest = 'Blog' | 'Teaching';

type SubscriberPostBody = {
  email?: string;
  name?: string;
  interests?: string[] | string;
  location?: string | null;
};

function bad(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function GET() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { subscribedAt: 'desc' },
  });
  return NextResponse.json(subscribers);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const debug = url.searchParams.get('debug') === '1'; // add ?debug=1 to see more logs

  try {
    const body = (await req.json()) as SubscriberPostBody;
    if (debug) console.log('[subscribers:POST] raw body:', body);

    // 1) Validate
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email) return bad(400, 'Email is required');

    const name = (body?.name ?? 'Anonymous').toString().trim();

    const normalizedInterests =
      Array.isArray(body?.interests)
        ? body!.interests
        : typeof body?.interests === 'string'
          ? body!.interests.split(',').map(t => t.trim())
          : [];

    if (!normalizedInterests.length) return bad(400, 'Select at least one interest');

    const interests = normalizedInterests.filter(Boolean) as Interest[];
    const location = (body?.location ?? '').toString();

    // 2) Write
    const sub = await prisma.subscriber.create({
      data: { email, name, interests, location },
    });

    // 3) Send welcome email, but never fail the subscription on email problems
    try {
      const { resend } = await import('@/lib/resend');
      if (resend) {
        const { sendWelcomeEmail } = await import('@/lib/email/sendWelcomeEmail');
        await sendWelcomeEmail({ to: sub.email, name: sub.name });
      } else if (debug) {
        console.warn('[subscribers:POST] Skipping email: RESEND_API_KEY missing.');
      }
    } catch (e) {
      console.error('[subscribers:POST] welcome email failed:', e);
    }

    return NextResponse.json(sub, { status: 201 });
  } catch (e: any) {
    // Prisma duplicate email
    if (e?.code === 'P2002' || /Unique constraint/i.test(String(e?.message))) {
      return bad(409, 'This email is already subscribed.');
    }
    console.error('[subscribers:POST] unhandled error:', e);
    return bad(500, 'Server error');
  }
}
