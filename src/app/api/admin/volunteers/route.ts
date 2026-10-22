import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const volunteers = await prisma.volunteer.findMany({
      include: {
        user: true,
        vehicles: true,
      },
      orderBy: { vol_id: 'asc' },
    });

    return NextResponse.json({
      volunteers: volunteers.map((v) => ({
        vol_id: v.vol_id,
        user_name: v.user.user_name,
        vol_name: v.vol_name,
        vol_lname: v.vol_lname,
        vol_num: v.vol_num,
        vol_lat: v.vol_lat,
        vol_long: v.vol_long,
        veh_id: v.vehicles[0]?.veh_id ?? null,
        veh_task_num: v.vehicles[0]?.veh_task_num ?? 0,
      })),
    });
  } catch (error) {
    console.error('Volunteers GET error:', error);
    return NextResponse.json({ error: 'Failed to load volunteers.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, password, vol_name, vol_lname, vol_long, vol_lat, vol_num } = body;

    if (
      !username ||
      !password ||
      !vol_name ||
      !vol_lname ||
      vol_long === undefined ||
      vol_lat === undefined ||
      !vol_num
    ) {
      return NextResponse.json({ error: 'Fill in all volunteer fields.' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { user_name: username.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    }

    const created = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          user_name: username.trim(),
          user_pass: password,
          user_type: 'volunteer',
        },
      });

      const volunteer = await tx.volunteer.create({
        data: {
          vol_id: newUser.user_id,
          vol_name: vol_name.trim(),
          vol_lname: vol_lname.trim(),
          vol_long: Number(vol_long),
          vol_lat: Number(vol_lat),
          vol_num: String(vol_num).trim(),
        },
      });

      await tx.vehicle.create({
        data: {
          veh_vol_id: newUser.user_id,
          veh_task_num: 0,
          longtitude: Number(vol_long),
          latitude: Number(vol_lat),
        },
      });

      return volunteer;
    });

    return NextResponse.json({ message: 'Volunteer Added!', volunteer: created });
  } catch (error) {
    console.error('Create volunteer error:', error);
    return NextResponse.json({ error: 'Failed to create volunteer.' }, { status: 500 });
  }
}

