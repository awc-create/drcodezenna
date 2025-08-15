import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type HeroGetResponse =
  | { image: string; subtitle: string; bio: string }
  | { error: string };

type HeroPostBody = {
  image: string;
  subtitles: Record<string, string>;
  bios: Record<string, string>;
};

export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get('page');
    if (!page) {
      return NextResponse.json<HeroGetResponse>(
        { error: 'Page query param required' },
        { status: 400 }
      );
    }

    const hero = await prisma.heroSection.findUnique({
      where: { id: 'shared' },
      include: { subtitles: true, bios: true },
    });

    if (!hero) {
      return NextResponse.json<HeroGetResponse>({
        image: '',
        subtitle: '',
        bio: '',
      });
    }

    const subtitle = hero.subtitles.find((s) => s.page === page)?.subtitle ?? '';
    const bio = hero.bios.find((b) => b.page === page)?.content ?? '';

    return NextResponse.json<HeroGetResponse>({
      image: hero.image,
      subtitle,
      bio,
    });
  } catch (err: unknown) {
    console.error('❌ GET /api/hero?page=... failed:', err);
    return NextResponse.json<HeroGetResponse>(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { image, subtitles, bios } = (await req.json()) as HeroPostBody;

    if (
      typeof image !== 'string' ||
      image.length === 0 ||
      typeof subtitles !== 'object' ||
      subtitles === null ||
      typeof bios !== 'object' ||
      bios === null
    ) {
      return NextResponse.json<{ error: string }>(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const shared = await prisma.heroSection.upsert({
      where: { id: 'shared' },
      update: { image },
      create: { id: 'shared', image },
    });

    const subtitleData = Object.entries(subtitles).map(([page, subtitle]) => ({
      page,
      subtitle: subtitle ?? '',
      heroId: shared.id,
    }));

    const bioData = Object.entries(bios).map(([page, content]) => ({
      page,
      content: content ?? '',
      heroId: shared.id,
    }));

    await prisma.$transaction([
      prisma.heroSubtitle.deleteMany({ where: { heroId: shared.id } }),
      prisma.heroBio.deleteMany({ where: { heroId: shared.id } }),
      prisma.heroSubtitle.createMany({ data: subtitleData }),
      prisma.heroBio.createMany({ data: bioData }),
    ]);

    return NextResponse.json<{ message: string }>({ message: 'Hero section saved' });
  } catch (err: unknown) {
    console.error('❌ Hero settings error:', err);
    return NextResponse.json<{ error: string }>(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
