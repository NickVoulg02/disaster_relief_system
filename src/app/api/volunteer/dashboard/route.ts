import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { haversineDistanceMeters } from '@/lib/geo';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.userType !== 'volunteer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const volunteer = await prisma.volunteer.findUnique({
      where: { vol_id: user.userId },
      include: {
        user: true,
        vehicles: {
          include: {
            veh_loads: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!volunteer) {
      return NextResponse.json({ error: 'Volunteer profile not found.' }, { status: 404 });
    }

    let vehicle = volunteer.vehicles[0];
    if (!vehicle) {
      const createdVeh = await prisma.vehicle.create({
        data: {
          veh_vol_id: volunteer.vol_id,
          veh_task_num: 0,
          latitude: volunteer.vol_lat,
          longtitude: volunteer.vol_long,
        },
        include: {
          veh_loads: { include: { product: true } },
        },
      });
      vehicle = createdVeh;
    }

    let base = await prisma.base.findFirst();
    if (!base) {
      base = await prisma.base.create({
        data: { id: 1, longtitude: 21.7351, latitude: 38.2462 },
      });
    }

    const [baseLoads, pendingTasksRaw, acceptedTasksRaw] = await Promise.all([
      prisma.baseLoad.findMany({
        include: { product: true },
        orderBy: { asdaa: 'asc' },
      }),
      prisma.task.findMany({
        where: {
          task_acceptance_date: null,
          task_completion_date: null,
        },
        include: {
          demand: {
            include: {
              citizen: true,
              product: true,
            },
          },
        },
      }),
      prisma.accept.findMany({
        where: { acc_vol_id: volunteer.vol_id },
        include: {
          task: {
            include: {
              demand: {
                include: {
                  citizen: true,
                  product: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const distanceToBase = haversineDistanceMeters(
      volunteer.vol_lat,
      volunteer.vol_long,
      base.latitude,
      base.longtitude
    );

    const pendingTasks = pendingTasksRaw.map((t) => ({
      task_id: t.task_id,
      dem_id: t.demand.dem_id,
      dem_type: t.demand.dem_type,
      dem_value: t.demand.dem_value ?? 0,
      pr_id: t.demand.dem_pr_id,
      pr_name: t.demand.product.pr_name,
      cit_name: t.demand.citizen.cit_name,
      cit_laname: t.demand.citizen.cit_laname,
      cit_number: t.demand.citizen.cit_number,
      cit_lat: t.demand.citizen.cit_lat,
      cit_long: t.demand.citizen.cit_long,
      task_submission_date: t.task_submission_date,
    }));

    const acceptedTasks = acceptedTasksRaw.map((a) => {
      const t = a.task;
      const dist = haversineDistanceMeters(
        volunteer.vol_lat,
        volunteer.vol_long,
        t.demand.citizen.cit_lat,
        t.demand.citizen.cit_long
      );
      return {
        task_id: t.task_id,
        dem_id: t.demand.dem_id,
        dem_type: t.demand.dem_type,
        dem_value: t.demand.dem_value ?? 0,
        pr_id: t.demand.dem_pr_id,
        pr_name: t.demand.product.pr_name,
        cit_name: t.demand.citizen.cit_name,
        cit_laname: t.demand.citizen.cit_laname,
        cit_number: t.demand.citizen.cit_number,
        cit_lat: t.demand.citizen.cit_lat,
        cit_long: t.demand.citizen.cit_long,
        task_submission_date: t.task_submission_date,
        task_acceptance_date: t.task_acceptance_date,
        user_name: volunteer.user.user_name,
        distanceMeters: Math.round(dist),
      };
    });

    return NextResponse.json({
      volunteer: {
        vol_id: volunteer.vol_id,
        user_name: volunteer.user.user_name,
        vol_name: volunteer.vol_name,
        vol_lname: volunteer.vol_lname,
        vol_num: volunteer.vol_num,
        vol_lat: volunteer.vol_lat,
        vol_long: volunteer.vol_long,
      },
      vehicle: {
        veh_id: vehicle.veh_id,
        veh_task_num: vehicle.veh_task_num,
        latitude: vehicle.latitude,
        longtitude: vehicle.longtitude,
        loads: vehicle.veh_loads.map((l) => ({
          pr_id: l.veh_load_prod,
          pr_name: l.product.pr_name,
          pr_quantity: l.pr_quantity,
        })),
      },
      base,
      distanceToBase: Math.round(distanceToBase),
      baseLoads: baseLoads
        .filter((b) => b.product !== null && (b.pr_quantity ?? 0) > 0)
        .map((b) => ({
          asdaa: b.asdaa,
          pr_id: b.pr_id!,
          pr_name: b.product!.pr_name,
          pr_quantity: b.pr_quantity ?? 0,
        })),
      pendingTasks,
      acceptedTasks,
    });
  } catch (error) {
    console.error('Volunteer dashboard GET error:', error);
    return NextResponse.json({ error: 'Failed to load volunteer dashboard.' }, { status: 500 });
  }
}

