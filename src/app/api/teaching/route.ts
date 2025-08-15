import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type TeachingPostBody = {
  title?: string;
  school?: string;
  year?: string;             // ← string per schema
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

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

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

    // Normalize tags
    const tags =
      Array.isArray(body.tags)
        ? body.tags.filter((t): t is string => typeof t === 'string').map((t) => t.trim()).filter(Boolean)
        : isNonEmptyString(body.tags)
          ? body.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [];

    // Validate required strings
    const errors: string[] = [];
    if (!isNonEmptyString(body.title)) errors.push('title is required');
    if (!isNonEmptyString(body.school)) errors.push('school is required');
    if (!isNonEmptyString(body.year)) errors.push('year is required (string)');
    if (!isNonEmptyString(body.type)) errors.push('type is required');
    if (!isNonEmptyString(body.description)) errors.push('description is required');
    if (!isNonEmptyString(body.fullText)) errors.push('fullText is required');

    if (errors.length) {
      return NextResponse.json({ error: 'Validation failed', issues: errors }, { status: 400 });
    }

    const newPost = await prisma.teachingPost.create({
      data: {
        title: body.title!,           // safe after validation
        school: body.school!,         // safe after validation
        year: body.year!,             // safe after validation
        type: body.type!,             // safe after validation
        isCurrent: Boolean(body.isCurrent),
        tags,
        description: body.description!, // safe after validation
        fullText: body.fullText!,       // safe after validation
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
