import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { TaskStatus } from '@prisma/client';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'citizen') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { pr_id, pr_name, quantity } = await request.json();
    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      return NextResponse.json(
        { error: 'Please enter a valid donation quantity (> 0).' },
        { status: 400 }
      );
    }

    let product = null;
    if (pr_id) {
      product = await prisma.product.findUnique({ where: { pr_id: Number(pr_id) } });
    } else if (pr_name) {
      product = await prisma.product.findFirst({ where: { pr_name: pr_name.trim() } });
    }

    if (!product) {
      return NextResponse.json({ error: 'Selected product not found.' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      const demand = await tx.demand.create({
        data: {
          dem_cit_id: user.userId,
          dem_pr_id: product.pr_id,
          dem_value: qty,
          dem_type: 'donation',
        },
      });

      await tx.task.create({
        data: {
          task_dem_id: demand.dem_id,
          task_submission_date: new Date(),
          task_status: TaskStatus.Not_Complete,
        },
      });
    });

    return NextResponse.json({ message: 'Donation has been submitted.' });
  } catch (error) {
    console.error('Create donation error:', error);
    return NextResponse.json({ error: 'Failed to submit donation.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'citizen') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const demId = Number(searchParams.get('id'));
    if (!demId) {
      return NextResponse.json({ error: 'Missing donation ID.' }, { status: 400 });
    }

    const demand = await prisma.demand.findFirst({
      where: {
        dem_id: demId,
        dem_cit_id: user.userId,
        dem_type: 'donation',
      },
      include: { tasks: true },
    });

    if (!demand) {
      return NextResponse.json({ error: 'Donation not found.' }, { status: 404 });
    }

    if (demand.tasks[0]?.task_status === TaskStatus.Complete) {
      return NextResponse.json(
        { error: 'Cannot cancel an already completed donation.' },
        { status: 400 }
      );
    }

    await prisma.demand.delete({
      where: { dem_id: demId },
    });

    return NextResponse.json({ message: 'Donation has been cancelled!' });
  } catch (error) {
    console.error('Cancel donation error:', error);
    return NextResponse.json({ error: 'Failed to cancel donation.' }, { status: 500 });
  }
}

