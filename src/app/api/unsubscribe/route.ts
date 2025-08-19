import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const t = searchParams.get("t");

  if (!t) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const sub = await prisma.subscriber.findFirst({
    where: { unsubscribeToken: t },
  });

  if (!sub) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
  }

  await prisma.subscriber.update({
    where: { id: sub.id },
    data: { unsubscribedAt: new Date() },
  });

  return NextResponse.json({ message: "You have been unsubscribed." });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body?.email || "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const sub = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (!sub) {
      return NextResponse.json({
        message: "You have been unsubscribed.",
      });
    }

    await prisma.subscriber.update({
      where: { id: sub.id },
      data: { unsubscribedAt: new Date() },
    });

    return NextResponse.json({ message: "You have been unsubscribed." });
  } catch {
    return NextResponse.json(
      { error: "Failed to process unsubscribe." },
      { status: 500 }
    );
  }
}
