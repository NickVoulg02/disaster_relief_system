import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { syncProductJson } from '@/lib/json-sync';

interface JsonProductItem {
  pr_name: string;
  pr_id?: number;
  pr_cat_id?: number;
  detail_name?: string;
  detail_value?: number;
  cat_name: string;
}

export async function GET() {
  const data = await syncProductJson();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const items: JsonProductItem[] = await request.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid JSON array format.' }, { status: 400 });
    }

    let importedCount = 0;
    for (const item of items) {
      if (!item.pr_name || !item.cat_name) continue;

      const catName = item.cat_name.trim().toUpperCase();
      let category = await prisma.category.findFirst({
        where: { cat_name: catName },
      });

      if (!category) {
        category = await prisma.category.create({
          data: { cat_name: catName },
        });
      }

      const existingProd = await prisma.product.findFirst({
        where: { pr_name: item.pr_name.trim() },
      });

      if (existingProd) {
        await prisma.product.update({
          where: { pr_id: existingProd.pr_id },
          data: {
            detail_name: item.detail_name ?? existingProd.detail_name,
            detail_value:
              item.detail_value !== undefined ? Number(item.detail_value) : existingProd.detail_value,
            pr_cat_id: category.cat_id,
          },
        });
      } else {
        await prisma.product.create({
          data: {
            pr_name: item.pr_name.trim(),
            detail_name: item.detail_name ?? 'Unit',
            detail_value: Number(item.detail_value ?? 1),
            pr_cat_id: category.cat_id,
          },
        });
      }
      importedCount++;
    }

    await syncProductJson();
    return NextResponse.json({
      message: `Successfully synchronized ${importedCount} products from JSON!`,
    });
  } catch (error) {
    console.error('JSON import error:', error);
    return NextResponse.json({ error: 'Failed to import JSON products.' }, { status: 500 });
  }
}

