import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, summary, content, image } = body;

    if (!title || !summary || !content || !image) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        summary,
        content,
        image,
        author: 'Dr Odera Ezenna', // ✅ Hardcoded for now
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error('[BLOG_POST_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(posts);
  } catch (err) {
    console.error('[BLOG_GET_ALL_ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
