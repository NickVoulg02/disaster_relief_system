import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { TaskStatus } from '@prisma/client';

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'year';

    const since = new Date();
    if (period === 'day') {
      since.setDate(since.getDate() - 1);
    } else if (period === 'week') {
      since.setDate(since.getDate() - 7);
    } else if (period === 'month') {
      since.setMonth(since.getMonth() - 1);
    } else if (period === '6month') {
      since.setMonth(since.getMonth() - 6);
    } else if (period === 'year') {
      since.setFullYear(2023);
    } else {
      since.setFullYear(2000);
    }

    const [completedRequests, incompleteRequests, incompleteDonations, completedDonations] =
      await Promise.all([
        prisma.task.count({
          where: {
            task_status: TaskStatus.Complete,
            task_submission_date: { gte: since },
            demand: { dem_type: 'request' },
          },
        }),
        prisma.task.count({
          where: {
            task_status: TaskStatus.Not_Complete,
            task_submission_date: { gte: since },
            demand: { dem_type: 'request' },
          },
        }),
        prisma.task.count({
          where: {
            task_status: TaskStatus.Not_Complete,
            task_submission_date: { gte: since },
            demand: { dem_type: 'donation' },
          },
        }),
        prisma.task.count({
          where: {
            task_status: TaskStatus.Complete,
            task_submission_date: { gte: since },
            demand: { dem_type: 'donation' },
          },
        }),
      ]);

    return NextResponse.json({
      completedRequests,
      incompleteRequests,
      incompleteDonations,
      completedDonations,
    });
  } catch (error) {
    console.error('Statistics error:', error);
    return NextResponse.json({ error: 'Failed to load statistics.' }, { status: 500 });
  }
}

