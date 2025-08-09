// src/app/api/media/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const media = await db.media.findMany({
      orderBy: { uploaded: 'desc' }, // ✅ this now matches your model
    });

    return NextResponse.json(media); // ✅ Always return array
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json([], { status: 500 }); // ✅ still return an array on error
  }
}
