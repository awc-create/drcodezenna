import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { blogSchema } from '@/schemas/blog';

const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return json({ error: 'Not found' }, 404);
    return json(post);
  } catch (err) {
    console.error('GET /api/blog/[id] error:', err);
    return json({ error: 'Server error' }, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = blogSchema.partial().safeParse(body);
    if (!parsed.success) {
      return json({
        error: 'Validation failed',
        issues: parsed.error.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      }, 400);
    }

    if (Object.keys(parsed.data).length === 0) {
      return json({ error: 'No valid fields to update' }, 400);
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: parsed.data,
    });

    return json(updated);
  } catch (err) {
    console.error('PUT /api/blog/[id] error:', err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return json({ error: 'Not found' }, 404);
    }
    return json({ error: 'Server error' }, 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });
    return json({ success: true });
  } catch (err) {
    console.error('DELETE /api/blog/[id] error:', err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return json({ error: 'Not found' }, 404);
    }
    return json({ error: 'Server error' }, 500);
  }
}
