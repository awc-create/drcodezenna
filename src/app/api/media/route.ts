import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: { uploaded: 'desc' },
    });
    return NextResponse.json(media);
  } catch (error: unknown) {
    console.error('Error fetching media:', error);
    return NextResponse.json([], { status: 500 });
  }
}
