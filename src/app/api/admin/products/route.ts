import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { syncProductJson } from '@/lib/json-sync';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [products, categories, baseLoads, announcements] = await Promise.all([
      prisma.product.findMany({
        include: { category: true },
        orderBy: { pr_id: 'asc' },
      }),
      prisma.category.findMany({
        orderBy: { cat_id: 'asc' },
      }),
      prisma.baseLoad.findMany({
        include: {
          product: {
            include: { category: true },
          },
        },
        orderBy: { asdaa: 'asc' },
      }),
      prisma.announcement.findMany({
        include: { product: true },
        orderBy: { ann_id: 'asc' },
      }),
    ]);

    await syncProductJson();

    return NextResponse.json({
      products: products.map((p) => ({
        pr_id: p.pr_id,
        pr_name: p.pr_name,
        pr_cat_id: p.pr_cat_id,
        detail_name: p.detail_name ?? '',
        detail_value: p.detail_value ?? 0,
        cat_name: p.category.cat_name,
      })),
      categories,
      baseLoads: baseLoads
        .filter((b) => b.product !== null)
        .map((b) => ({
          asdaa: b.asdaa,
          pr_id: b.pr_id!,
          pr_name: b.product!.pr_name,
          cat_name: b.product!.category.cat_name,
          pr_quantity: b.pr_quantity ?? 0,
        })),
      announcements: announcements.map((a) => ({
        ann_id: a.ann_id,
        ann_pr_id: a.ann_pr_id,
        pr_name: a.product.pr_name,
        ann_value: a.ann_value ?? 0,
      })),
    });
  } catch (error) {
    console.error('Admin GET products error:', error);
    return NextResponse.json({ error: 'Failed to load base data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { pr_name, detail_name, detail_value, cat_name } = body;

    if (!pr_name || !detail_name || detail_value === undefined || !cat_name) {
      return NextResponse.json({ error: 'All product fields are required.' }, { status: 400 });
    }

    let category = await prisma.category.findFirst({
      where: { cat_name: cat_name.trim() },
    });

    if (!category) {
      category = await prisma.category.create({
        data: { cat_name: cat_name.trim().toUpperCase() },
      });
    }

    const product = await prisma.product.create({
      data: {
        pr_name: pr_name.trim(),
        detail_name: detail_name.trim(),
        detail_value: Number(detail_value),
        pr_cat_id: category.cat_id,
      },
    });

    await syncProductJson();

    return NextResponse.json({ message: 'Product Added', product });
  } catch (error) {
    console.error('Admin POST product error:', error);
    return NextResponse.json({ error: 'Failed to add product.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { pr_id, pr_name, detail_name, detail_value, cat_name } = body;

    if (!pr_id || !pr_name || !detail_name || detail_value === undefined || !cat_name) {
      return NextResponse.json({ error: 'All product fields are required.' }, { status: 400 });
    }

    let category = await prisma.category.findFirst({
      where: { cat_name: cat_name.trim() },
    });

    if (!category) {
      category = await prisma.category.create({
        data: { cat_name: cat_name.trim().toUpperCase() },
      });
    }

    const updated = await prisma.product.update({
      where: { pr_id: Number(pr_id) },
      data: {
        pr_name: pr_name.trim(),
        detail_name: detail_name.trim(),
        detail_value: Number(detail_value),
        pr_cat_id: category.cat_id,
      },
    });

    await syncProductJson();

    return NextResponse.json({ message: 'Product Submitted', product: updated });
  } catch (error) {
    console.error('Admin PUT product error:', error);
    return NextResponse.json({ error: 'Failed to update product.' }, { status: 500 });
  }
}

