import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { cat_name } = await request.json();
    if (!cat_name || !cat_name.trim()) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const normalized = cat_name.trim().toUpperCase();
    const existing = await prisma.category.findFirst({
      where: { cat_name: normalized },
    });

    if (existing) {
      return NextResponse.json({ error: 'Category already exists.' }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: { cat_name: normalized },
    });

    return NextResponse.json({ message: 'Category Added!', category });
  } catch (error) {
    console.error('Add category error:', error);
    return NextResponse.json({ error: 'Failed to add category.' }, { status: 500 });
  }
}

