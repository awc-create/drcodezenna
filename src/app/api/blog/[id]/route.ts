// src/app/api/blog/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { blogSchema } from '@/schemas/blog';

// Type for params in this dynamic route
type BlogRouteParams = { params: { id: string | string[] } };

const getId = (rawId: string | string[]): string =>
  Array.isArray(rawId) ? rawId[0] : rawId;

const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status });

export async function GET(
  _req: NextRequest,
  { params }: BlogRouteParams
) {
  try {
    const id = getId(params.id);
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return json({ error: 'Not found' }, 404);
    return json(post);
  } catch (err) {
    console.error('GET /api/blog/[id] error:', err);
    return json({ error: 'Server error' }, 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: BlogRouteParams
) {
  try {
    const id = getId(params.id);
    const body = await req.json();

    // Validate with partial schema for updates
    const parsed = blogSchema.partial().safeParse(body);
    if (!parsed.success) {
      return json(
        {
          error: 'Validation failed',
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        400
      );
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

export async function DELETE(
  _req: NextRequest,
  { params }: BlogRouteParams
) {
  try {
    const id = getId(params.id);
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
