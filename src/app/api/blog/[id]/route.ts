import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Record<string, string | string[]> };

const getId = (params: RouteContext['params']): string => {
  const raw = params.id;
  return Array.isArray(raw) ? raw[0] : raw;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const id = getId(params);
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const id = getId(params);
    const body = await req.json();
    const updated = await prisma.blogPost.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const id = getId(params);
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
