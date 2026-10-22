import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let base = await prisma.base.findFirst();
    if (!base) {
      base = await prisma.base.create({
        data: { id: 1, longtitude: 21.7351, latitude: 38.2462 },
      });
    }

    const [vehicles, activeTasks, baseLoads, vehLoads, categories, allTasks] = await Promise.all([
      prisma.vehicle.findMany({
        include: {
          volunteer: {
            include: { user: true },
          },
          veh_loads: {
            include: { product: true },
          },
        },
      }),
      prisma.task.findMany({
        where: { task_completion_date: null },
        include: {
          demand: {
            include: {
              citizen: true,
              product: true,
            },
          },
          accepts: {
            include: {
              volunteer: {
                include: {
                  user: true,
                  vehicles: true,
                },
              },
            },
          },
        },
      }),
      prisma.baseLoad.findMany({
        include: {
          product: { include: { category: true } },
        },
        orderBy: { asdaa: 'asc' },
      }),
      prisma.vehLoad.findMany({
        include: {
          product: { include: { category: true } },
          vehicle: {
            include: {
              volunteer: { include: { user: true } },
            },
          },
        },
      }),
      prisma.category.findMany({ orderBy: { cat_id: 'asc' } }),
      prisma.task.findMany({
        include: {
          demand: {
            include: {
              citizen: true,
              product: true,
            },
          },
        },
        orderBy: { task_submission_date: 'desc' },
      }),
    ]);

    const formattedDemands = activeTasks.map((t) => {
      const acceptedBy = t.accepts[0];
      const veh = acceptedBy?.volunteer?.vehicles[0];
      return {
        task_id: t.task_id,
        dem_id: t.demand.dem_id,
        cit_id: t.demand.citizen.cit_id,
        cit_name: t.demand.citizen.cit_name,
        cit_laname: t.demand.citizen.cit_laname,
        cit_number: t.demand.citizen.cit_number,
        cit_lat: t.demand.citizen.cit_lat,
        cit_long: t.demand.citizen.cit_long,
        dem_type: t.demand.dem_type,
        dem_value: t.demand.dem_value ?? 0,
        pr_name: t.demand.product.pr_name,
        task_submission_date: t.task_submission_date,
        task_acceptance_date: t.task_acceptance_date,
        task_completion_date: t.task_completion_date,
        acc_vol_id: acceptedBy?.acc_vol_id ?? null,
        veh_id: veh?.veh_id ?? null,
        veh_lat: veh?.latitude ?? null,
        veh_long: veh?.longtitude ?? null,
        user_name: acceptedBy?.volunteer?.user?.user_name ?? null,
      };
    });

    const formattedVehicles = vehicles.map((v) => ({
      veh_id: v.veh_id,
      veh_vol_id: v.veh_vol_id,
      veh_task_num: v.veh_task_num,
      latitude: v.latitude,
      longtitude: v.longtitude,
      user_name: v.volunteer.user.user_name,
      vol_name: v.volunteer.vol_name,
      vol_lname: v.volunteer.vol_lname,
      loads: v.veh_loads.map((l) => ({
        pr_id: l.veh_load_prod,
        pr_name: l.product.pr_name,
        pr_quantity: l.pr_quantity,
      })),
    }));

    const inventory = [
      ...baseLoads
        .filter((b) => b.product !== null)
        .map((b) => ({
          id: `base-${b.asdaa}`,
          pr_id: b.pr_id!,
          pr_name: b.product!.pr_name,
          cat_name: b.product!.category.cat_name,
          quantity: b.pr_quantity ?? 0,
          location: 'Base' as const,
          volunteerUsername: 'Not inside a vehicle',
        })),
      ...vehLoads.map((vl) => ({
        id: `veh-${vl.veh_load_id}-${vl.veh_load_prod}`,
        pr_id: vl.veh_load_prod,
        pr_name: vl.product.pr_name,
        cat_name: vl.product.category.cat_name,
        quantity: vl.pr_quantity,
        location: 'Vehicle' as const,
        volunteerUsername: vl.vehicle.volunteer.user.user_name,
      })),
    ];

    return NextResponse.json({
      base,
      vehicles: formattedVehicles,
      demands: formattedDemands,
      inventory,
      categories,
      allTasks: allTasks.map((t) => ({
        task_id: t.task_id,
        dem_type: t.demand.dem_type,
        pr_name: t.demand.product.pr_name,
        dem_value: t.demand.dem_value,
        cit_name: `${t.demand.citizen.cit_name} ${t.demand.citizen.cit_laname}`,
        task_submission_date: t.task_submission_date,
        task_acceptance_date: t.task_acceptance_date,
        task_completion_date: t.task_completion_date,
        task_status: t.task_status === 'Complete' ? 'Complete' : 'Not Complete',
      })),
    });
  } catch (error) {
    console.error('Admin map GET error:', error);
    return NextResponse.json({ error: 'Failed to load map data.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { latitude, longtitude } = await request.json();
    const updated = await prisma.base.upsert({
      where: { id: 1 },
      update: {
        latitude: Number(latitude),
        longtitude: Number(longtitude),
      },
      create: {
        id: 1,
        latitude: Number(latitude),
        longtitude: Number(longtitude),
      },
    });

    return NextResponse.json({ message: 'Base location updated', base: updated });
  } catch (error) {
    console.error('Admin update base location error:', error);
    return NextResponse.json({ error: 'Failed to update base location.' }, { status: 500 });
  }
}

