import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'volunteer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { latitude, longtitude } = await request.json();
    const lat = Number(latitude);
    const lng = Number(longtitude);

    await prisma.$transaction([
      prisma.volunteer.update({
        where: { vol_id: user.userId },
        data: { vol_lat: lat, vol_long: lng },
      }),
      prisma.vehicle.updateMany({
        where: { veh_vol_id: user.userId },
        data: { latitude: lat, longtitude: lng },
      }),
    ]);

    return NextResponse.json({ message: 'Vehicle location updated!' });
  } catch (error) {
    console.error('Update volunteer location error:', error);
    return NextResponse.json({ error: 'Failed to update location.' }, { status: 500 });
  }
}

