// src/app/api/hero/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/hero?page=home
 * Fetches hero image, subtitle and bio for a specific page.
 */
export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get('page');

    if (!page) {
      return NextResponse.json({ error: 'Page query param required' }, { status: 400 });
    }

    const hero = await prisma.heroSection.findUnique({
      where: { id: 'shared' },
      include: {
        subtitles: true,
        bios: true,
      },
    });

    if (!hero) {
      return NextResponse.json({ image: '', subtitle: '', bio: '' });
    }

    const subtitle = hero.subtitles.find((s) => s.page === page)?.subtitle || '';
    const bio = hero.bios.find((b) => b.page === page)?.content || '';

    return NextResponse.json({
      image: hero.image,
      subtitle,
      bio,
    });
  } catch (err) {
    console.error('❌ GET /api/hero?page=... failed:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/hero
 * Updates the shared image and per-page subtitles/bios.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, subtitles, bios } = body;

    if (!image || typeof subtitles !== 'object' || typeof bios !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Upsert the shared hero section
    const shared = await prisma.heroSection.upsert({
      where: { id: 'shared' },
      update: { image },
      create: { id: 'shared', image },
    });

    // Delete existing subtitles and bios
    await prisma.heroSubtitle.deleteMany({ where: { heroId: shared.id } });
    await prisma.heroBio.deleteMany({ where: { heroId: shared.id } });

    // Insert updated subtitles
    const subtitleData = Object.entries(subtitles).map(([page, subtitle]) => ({
      page,
      subtitle,
      heroId: shared.id,
    }));

    // Insert updated bios
    const bioData = Object.entries(bios).map(([page, content]) => ({
      page,
      content,
      heroId: shared.id,
    }));

    await prisma.heroSubtitle.createMany({ data: subtitleData });
    await prisma.heroBio.createMany({ data: bioData });

    return NextResponse.json({ message: 'Hero section saved' });
  } catch (err) {
    console.error('❌ Hero settings error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
