import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.userType !== 'citizen') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [citizen, categories, products, announcements, demands] = await Promise.all([
      prisma.citizen.findUnique({
        where: { cit_id: user.userId },
        include: { user: true },
      }),
      prisma.category.findMany({ orderBy: { cat_id: 'asc' } }),
      prisma.product.findMany({
        include: { category: true },
        orderBy: { pr_id: 'asc' },
      }),
      prisma.announcement.findMany({
        include: { product: true },
        orderBy: { ann_id: 'asc' },
      }),
      prisma.demand.findMany({
        where: { dem_cit_id: user.userId },
        include: {
          product: true,
          tasks: true,
        },
        orderBy: { dem_id: 'desc' },
      }),
    ]);

    const requests = demands
      .filter((d) => d.dem_type === 'request')
      .map((d) => {
        const t = d.tasks[0];
        return {
          dem_id: d.dem_id,
          pr_id: d.dem_pr_id,
          pr_name: d.product.pr_name,
          dem_value: d.dem_value ?? 0,
          task_id: t?.task_id ?? null,
          task_submission_date: t?.task_submission_date ?? null,
          task_acceptance_date: t?.task_acceptance_date ?? null,
          task_completion_date: t?.task_completion_date ?? null,
          task_status: t?.task_status === 'Complete' ? 'Complete' : 'Not Complete',
        };
      });

    const donations = demands
      .filter((d) => d.dem_type === 'donation')
      .map((d) => {
        const t = d.tasks[0];
        return {
          dem_id: d.dem_id,
          pr_id: d.dem_pr_id,
          pr_name: d.product.pr_name,
          dem_value: d.dem_value ?? 0,
          task_id: t?.task_id ?? null,
          task_submission_date: t?.task_submission_date ?? null,
          task_acceptance_date: t?.task_acceptance_date ?? null,
          task_completion_date: t?.task_completion_date ?? null,
          task_status: t?.task_status === 'Complete' ? 'Complete' : 'Not Complete',
        };
      });

    return NextResponse.json({
      citizen,
      categories,
      products: products.map((p) => ({
        pr_id: p.pr_id,
        pr_name: p.pr_name,
        pr_cat_id: p.pr_cat_id,
        detail_name: p.detail_name ?? '',
        detail_value: p.detail_value ?? 0,
        cat_name: p.category.cat_name,
      })),
      announcements: announcements.map((a) => ({
        ann_id: a.ann_id,
        ann_pr_id: a.ann_pr_id,
        pr_name: a.product.pr_name,
        ann_value: a.ann_value ?? 0,
      })),
      requests,
      donations,
    });
  } catch (error) {
    console.error('Citizen dashboard GET error:', error);
    return NextResponse.json({ error: 'Failed to load citizen dashboard.' }, { status: 500 });
  }
}

