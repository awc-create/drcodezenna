import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { subscribedAt: 'desc' },
  });
  return NextResponse.json(subscribers);
}

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const sub = await prisma.subscriber.create({
      data: { email: body.email, name: body.name },
    });
    return NextResponse.json(sub);
  } catch (error) {
    console.error('Failed to create subscriber:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
}
