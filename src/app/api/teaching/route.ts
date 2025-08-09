import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type TeachingPostBody = {
  title?: string;
  school?: string;
  year?: number;
  type?: string;
  isCurrent?: boolean;
  tags?: string[] | string;
  description?: string;
  fullText?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
};

const toDate = (v: unknown): Date | undefined => {
  if (v instanceof Date) return v;
  if (typeof v === 'string' && v.length) {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
};

export async function GET() {
  try {
    const posts = await prisma.teachingPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts);
  } catch (err: unknown) {
    console.error('[GET /api/teaching] Error fetching posts:', err);
    return NextResponse.json<{ error: string }>(
      { error: 'Failed to fetch teaching posts' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TeachingPostBody;

    const tags =
      Array.isArray(body.tags)
        ? body.tags
        : typeof body.tags === 'string' && body.tags.length
          ? body.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [];

    const newPost = await prisma.teachingPost.create({
      data: {
        title: body.title,
        school: body.school,
        year: body.year,
        type: body.type,
        isCurrent: Boolean(body.isCurrent),
        tags,
        description: body.description,
        fullText: body.fullText,
        startDate: toDate(body.startDate ?? undefined),
        endDate: toDate(body.endDate ?? undefined),
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (err: unknown) {
    console.error('[POST /api/teaching] Error creating post:', err);
    return NextResponse.json<{ error: string }>(
      { error: 'Failed to create teaching post' },
      { status: 500 }
    );
  }
}
