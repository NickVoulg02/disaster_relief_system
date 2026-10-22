import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ann_pr_id, ann_value } = await request.json();
    const prId = Number(ann_pr_id);
    const val = Number(ann_value);

    if (!prId || !val || val <= 0) {
      return NextResponse.json({ error: 'Select a valid product and quantity (> 0).' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        ann_pr_id: prId,
        ann_value: val,
      },
    });

    return NextResponse.json({ message: 'Announcement Added', announcement });
  } catch (error) {
    console.error('Add announcement error:', error);
    return NextResponse.json({ error: 'Failed to create announcement.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!id) {
      return NextResponse.json({ error: 'Missing announcement ID.' }, { status: 400 });
    }

    await prisma.announcement.delete({
      where: { ann_id: id },
    });

    return NextResponse.json({ message: 'Announcement Deleted!' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json({ error: 'Failed to delete announcement.' }, { status: 500 });
  }
}

