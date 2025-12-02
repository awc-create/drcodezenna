// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export const runtime = 'nodejs';

const FROM =
  process.env.RESEND_FROM ?? 'Dr. Odera Ezenna <no-reply@drcodezenna.com>';

// Where contact messages should land.
// You can set CONTACT_TO explicitly, or it will fall back to your reply-to
// (e.g. RESEND_REPLY_TO=drcodezenna@gmail.com), then FROM.
const CONTACT_TO =
  process.env.CONTACT_TO ||
  process.env.RESEND_CONTACT_TO ||
  process.env.RESEND_REPLY_TO ||
  FROM;

// Minimal shape of the Resend response we care about.
// This matches the SDK fairly closely but only includes what we use.
type ResendSendResult = {
  data?: { id: string } | null;
  error?: { message?: string } | null;
};

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    const trimmedName = String(name ?? '').trim();
    const trimmedEmail = String(email ?? '').trim();
    const trimmedMessage = String(message ?? '').trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return NextResponse.json(
        { error: 'Please fill in all fields.' },
        { status: 400 }
      );
    }

    // If Resend isn’t configured, don’t hard-fail – just log & pretend success
    if (!resend) {
      console.warn('[contact] Resend not configured. Message was:', {
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });
      return NextResponse.json({ ok: true, skipped: true });
    }

    const safeMessage = trimmedMessage.replace(/\n/g, '<br />');

    const result = (await resend.emails.send({
      from: FROM,
      to: CONTACT_TO,
      subject: `New contact form message from ${trimmedName}`,
      html: `
        <p><strong>From:</strong> ${trimmedName} &lt;${trimmedEmail}&gt;</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
      replyTo: trimmedEmail,
    })) as ResendSendResult;

    if (result.error) {
      console.error('[contact] Resend error:', result.error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact] POST error:', err);
    return NextResponse.json(
      { error: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}
