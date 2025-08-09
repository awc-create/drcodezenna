import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.teachingPost.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posts);
  } catch (err) {
    console.error('[GET /api/teaching] Error fetching posts:', err);
    return NextResponse.json({ error: 'Failed to fetch teaching posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('[POST /api/teaching] Incoming body:', body);

    const tags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === 'string' && body.tags.length
        ? body.tags.split(',').map((t: string) => t.trim())
        : [];

    const postData = {
      title: body.title,
      school: body.school,
      year: body.year,
      type: body.type,
      isCurrent: body.isCurrent,
      tags,
      description: body.description,
      fullText: body.fullText,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    };

    console.log('[POST /api/teaching] Final postData:', postData);

    const newPost = await prisma.teachingPost.create({ data: postData });

    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    console.error('[POST /api/teaching] Error creating post:', err);
    return NextResponse.json({ error: 'Failed to create teaching post' }, { status: 500 });
  }
}

