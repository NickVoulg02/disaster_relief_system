import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { haversineDistanceMeters } from '@/lib/geo';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'volunteer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, items } = body;

    const [volunteer, base, vehicle] = await Promise.all([
      prisma.volunteer.findUnique({ where: { vol_id: user.userId } }),
      prisma.base.findFirst(),
      prisma.vehicle.findFirst({ where: { veh_vol_id: user.userId } }),
    ]);

    if (!volunteer || !base || !vehicle) {
      return NextResponse.json({ error: 'Volunteer, Vehicle, or Base not found.' }, { status: 404 });
    }

    const distance = haversineDistanceMeters(
      volunteer.vol_lat,
      volunteer.vol_long,
      base.latitude,
      base.longtitude
    );

    if (distance > 100) {
      return NextResponse.json(
        {
          error: `Vehicle is ${Math.round(distance)}m away from the Base. You must be within 100m of the Base to load or unload supplies.`,
        },
        { status: 400 }
      );
    }

    if (action === 'load') {
      // Replaces stored procedure `load_from_base`
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'Select at least one item and quantity to load.' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          const prId = Number(item.pr_id);
          const qty = Number(item.quantity);
          if (!prId || !qty || qty <= 0) continue;

          const baseItem = await tx.baseLoad.findFirst({ where: { pr_id: prId } });
          if (!baseItem || (baseItem.pr_quantity ?? 0) < qty) {
            throw new Error(`Not enough quantity in Base for product #${prId}.`);
          }

          if ((baseItem.pr_quantity ?? 0) === qty) {
            await tx.baseLoad.delete({ where: { asdaa: baseItem.asdaa } });
          } else {
            await tx.baseLoad.update({
              where: { asdaa: baseItem.asdaa },
              data: { pr_quantity: (baseItem.pr_quantity ?? 0) - qty },
            });
          }

          const existingVehLoad = await tx.vehLoad.findUnique({
            where: {
              veh_load_id_veh_load_prod: {
                veh_load_id: vehicle.veh_id,
                veh_load_prod: prId,
              },
            },
          });

          if (existingVehLoad) {
            await tx.vehLoad.update({
              where: {
                veh_load_id_veh_load_prod: {
                  veh_load_id: vehicle.veh_id,
                  veh_load_prod: prId,
                },
              },
              data: { pr_quantity: existingVehLoad.pr_quantity + qty },
            });
          } else {
            await tx.vehLoad.create({
              data: {
                veh_load_id: vehicle.veh_id,
                veh_load_prod: prId,
                pr_quantity: qty,
              },
            });
          }
        }
      });

      return NextResponse.json({ message: 'Items loaded onto vehicle successfully!' });
    }

    if (action === 'unload') {
      // Replaces stored procedure `load_to_base`
      await prisma.$transaction(async (tx) => {
        const vehLoads = await tx.vehLoad.findMany({
          where: { veh_load_id: vehicle.veh_id },
        });

        for (const row of vehLoads) {
          await tx.vehLoad.delete({
            where: {
              veh_load_id_veh_load_prod: {
                veh_load_id: row.veh_load_id,
                veh_load_prod: row.veh_load_prod,
              },
            },
          });

          const existingBaseLoad = await tx.baseLoad.findFirst({
            where: { pr_id: row.veh_load_prod },
          });

          if (existingBaseLoad) {
            await tx.baseLoad.update({
              where: { asdaa: existingBaseLoad.asdaa },
              data: { pr_quantity: (existingBaseLoad.pr_quantity ?? 0) + row.pr_quantity },
            });
          } else {
            await tx.baseLoad.create({
              data: {
                base_id: 1,
                pr_id: row.veh_load_prod,
                pr_quantity: row.pr_quantity,
              },
            });
          }
        }
      });

      return NextResponse.json({ message: 'All vehicle cargo unloaded to Base!' });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to process cargo operation.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

