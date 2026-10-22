import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { haversineDistanceMeters } from '@/lib/geo';
import { TaskStatus } from '@prisma/client';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'volunteer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, task_id } = await request.json();
    const taskId = Number(task_id);
    if (!taskId) {
      return NextResponse.json({ error: 'Missing task_id.' }, { status: 400 });
    }

    const volunteer = await prisma.volunteer.findUnique({
      where: { vol_id: user.userId },
      include: { vehicles: true },
    });

    const vehicle = volunteer?.vehicles[0];
    if (!volunteer || !vehicle) {
      return NextResponse.json({ error: 'Volunteer or vehicle not found.' }, { status: 404 });
    }

    if (action === 'accept') {
      // Replaces change_task_to_accepted.php + triggers update_task1 & update_veh1
      if (vehicle.veh_task_num >= 4) {
        return NextResponse.json(
          { error: 'Maximum limit of 4 active tasks per vehicle reached.' },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        const existingAccept = await tx.accept.findFirst({
          where: { acc_task_id: taskId },
        });
        if (existingAccept) {
          throw new Error('This task has already been accepted.');
        }

        await tx.accept.create({
          data: {
            acc_vol_id: volunteer.vol_id,
            acc_task_id: taskId,
          },
        });

        await tx.task.update({
          where: { task_id: taskId },
          data: { task_acceptance_date: new Date() },
        });

        await tx.vehicle.update({
          where: { veh_id: vehicle.veh_id },
          data: { veh_task_num: { increment: 1 } },
        });
      });

      return NextResponse.json({ message: 'Task accepted!' });
    }

    if (action === 'cancel') {
      // Replaces CancelTaskProc + trigger update_veh2
      await prisma.$transaction(async (tx) => {
        const existing = await tx.accept.findUnique({
          where: {
            acc_vol_id_acc_task_id: {
              acc_vol_id: volunteer.vol_id,
              acc_task_id: taskId,
            },
          },
        });

        if (!existing) {
          throw new Error('Task acceptance not found.');
        }

        await tx.accept.delete({
          where: {
            acc_vol_id_acc_task_id: {
              acc_vol_id: volunteer.vol_id,
              acc_task_id: taskId,
            },
          },
        });

        await tx.task.update({
          where: { task_id: taskId },
          data: { task_acceptance_date: null },
        });

        await tx.vehicle.update({
          where: { veh_id: vehicle.veh_id },
          data: {
            veh_task_num: Math.max(0, vehicle.veh_task_num - 1),
          },
        });
      });

      return NextResponse.json({ message: 'Task cancelled and returned to pending pool.' });
    }

    if (action === 'complete') {
      // Replaces CompleteTaskProc + TaskDistanceCheck (<= 50m) + trigger update_veh2
      const taskRecord = await prisma.task.findUnique({
        where: { task_id: taskId },
        include: {
          demand: {
            include: {
              citizen: true,
              product: true,
            },
          },
        },
      });

      if (!taskRecord) {
        return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
      }

      const distance = haversineDistanceMeters(
        volunteer.vol_lat,
        volunteer.vol_long,
        taskRecord.demand.citizen.cit_lat,
        taskRecord.demand.citizen.cit_long
      );

      if (distance > 50) {
        return NextResponse.json(
          {
            error: `Unable to complete task: Your vehicle is ${Math.round(
              distance
            )}m away from the citizen (must be within 50m). Drag your vehicle marker closer on the map.`,
          },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        const acceptRow = await tx.accept.findUnique({
          where: {
            acc_vol_id_acc_task_id: {
              acc_vol_id: volunteer.vol_id,
              acc_task_id: taskId,
            },
          },
        });

        if (!acceptRow) {
          throw new Error('Task not found in your accepted tasks.');
        }

        const prId = taskRecord.demand.dem_pr_id;
        const sum = taskRecord.demand.dem_value ?? 0;
        const demType = taskRecord.demand.dem_type;

        if (demType === 'request') {
          const currentLoad = await tx.vehLoad.findUnique({
            where: {
              veh_load_id_veh_load_prod: {
                veh_load_id: vehicle.veh_id,
                veh_load_prod: prId,
              },
            },
          });

          if (!currentLoad || currentLoad.pr_quantity < sum) {
            throw new Error(
              `Not enough ${taskRecord.demand.product.pr_name} in your vehicle cargo (need ${sum}, have ${
                currentLoad?.pr_quantity ?? 0
              }).`
            );
          }

          if (currentLoad.pr_quantity === sum) {
            await tx.vehLoad.delete({
              where: {
                veh_load_id_veh_load_prod: {
                  veh_load_id: vehicle.veh_id,
                  veh_load_prod: prId,
                },
              },
            });
          } else {
            await tx.vehLoad.update({
              where: {
                veh_load_id_veh_load_prod: {
                  veh_load_id: vehicle.veh_id,
                  veh_load_prod: prId,
                },
              },
              data: { pr_quantity: currentLoad.pr_quantity - sum },
            });
          }
        } else if (demType === 'donation') {
          const currentLoad = await tx.vehLoad.findUnique({
            where: {
              veh_load_id_veh_load_prod: {
                veh_load_id: vehicle.veh_id,
                veh_load_prod: prId,
              },
            },
          });

          if (currentLoad) {
            await tx.vehLoad.update({
              where: {
                veh_load_id_veh_load_prod: {
                  veh_load_id: vehicle.veh_id,
                  veh_load_prod: prId,
                },
              },
              data: { pr_quantity: currentLoad.pr_quantity + sum },
            });
          } else {
            await tx.vehLoad.create({
              data: {
                veh_load_id: vehicle.veh_id,
                veh_load_prod: prId,
                pr_quantity: sum,
              },
            });
          }
        }

        await tx.task.update({
          where: { task_id: taskId },
          data: {
            task_completion_date: new Date(),
            task_status: TaskStatus.Complete,
          },
        });

        await tx.accept.delete({
          where: {
            acc_vol_id_acc_task_id: {
              acc_vol_id: volunteer.vol_id,
              acc_task_id: taskId,
            },
          },
        });

        await tx.vehicle.update({
          where: { veh_id: vehicle.veh_id },
          data: {
            veh_task_num: Math.max(0, vehicle.veh_task_num - 1),
          },
        });
      });

      return NextResponse.json({ message: 'Task completed successfully!' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Task operation failed.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

