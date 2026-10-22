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
    const { pr_id, pr_name, people } = await request.json();
    const numPeople = Number(people);

    if (!numPeople || numPeople <= 0) {
      return NextResponse.json(
        { error: 'Please enter a valid number of family members (> 0).' },
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
      return NextResponse.json({ error: 'Selected product was not found.' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      const demand = await tx.demand.create({
        data: {
          dem_cit_id: user.userId,
          dem_pr_id: product.pr_id,
          dem_value: numPeople,
          dem_type: 'request',
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

    return NextResponse.json({ message: 'Request has been submitted.' });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Failed to submit request.' }, { status: 500 });
  }
}

