import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { syncProductJson } from '@/lib/json-sync';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, id, quantity } = await request.json();
    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      return NextResponse.json({ error: 'Invalid quantity (must be > 0).' }, { status: 400 });
    }

    if (action === 'add_to_base') {
      // Replaces stored procedure `add_to_base(in_pr_id, base_quantity)`
      const prId = Number(id);
      const message = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({ where: { pr_id: prId } });
        if (!product || (product.detail_value ?? 0) < qty) {
          throw new Error('Requested quantity is not available in storage.');
        }

        await tx.product.update({
          where: { pr_id: prId },
          data: { detail_value: (product.detail_value ?? 0) - qty },
        });

        let baseExists = await tx.base.findUnique({ where: { id: 1 } });
        if (!baseExists) {
          await tx.base.create({
            data: { id: 1, longtitude: 21.7351, latitude: 38.2462 },
          });
        }

        const existingLoad = await tx.baseLoad.findFirst({
          where: { pr_id: prId },
        });

        if (existingLoad) {
          await tx.baseLoad.update({
            where: { asdaa: existingLoad.asdaa },
            data: { pr_quantity: (existingLoad.pr_quantity ?? 0) + qty },
          });
        } else {
          await tx.baseLoad.create({
            data: { base_id: 1, pr_id: prId, pr_quantity: qty },
          });
        }

        return 'Product Added to Base';
      });

      await syncProductJson();
      return NextResponse.json({ message });
    }

    if (action === 'return_to_storage') {
      // Replaces legacy removeBase.php
      const asdaaId = Number(id);
      const message = await prisma.$transaction(async (tx) => {
        const baseRow = await tx.baseLoad.findUnique({ where: { asdaa: asdaaId } });
        if (!baseRow || (baseRow.pr_quantity ?? 0) < qty) {
          throw new Error('Requested quantity is not available in Base.');
        }

        const newQty = (baseRow.pr_quantity ?? 0) - qty;
        let msg = 'Quantity available has been updated';
        if (newQty === 0) {
          await tx.baseLoad.delete({ where: { asdaa: asdaaId } });
          msg = 'Product no longer available';
        } else {
          await tx.baseLoad.update({
            where: { asdaa: asdaaId },
            data: { pr_quantity: newQty },
          });
        }

        if (baseRow.pr_id) {
          const product = await tx.product.findUnique({ where: { pr_id: baseRow.pr_id } });
          if (product) {
            await tx.product.update({
              where: { pr_id: baseRow.pr_id },
              data: { detail_value: (product.detail_value ?? 0) + qty },
            });
          }
        }

        return msg;
      });

      await syncProductJson();
      return NextResponse.json({ message });
    }

    if (action === 'remove_entirely') {
      // Replaces legacy removeEntire.php
      const asdaaId = Number(id);
      const message = await prisma.$transaction(async (tx) => {
        const baseRow = await tx.baseLoad.findUnique({ where: { asdaa: asdaaId } });
        if (!baseRow || (baseRow.pr_quantity ?? 0) < qty) {
          throw new Error('Requested quantity exceeds available Base stock.');
        }

        const newQty = (baseRow.pr_quantity ?? 0) - qty;
        if (newQty === 0) {
          await tx.baseLoad.delete({ where: { asdaa: asdaaId } });
          return 'Product removed from base';
        } else {
          await tx.baseLoad.update({
            where: { asdaa: asdaaId },
            data: { pr_quantity: newQty },
          });
          return 'Quantity removed from base';
        }
      });

      return NextResponse.json({ message });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Operation failed.';
    return NextResponse.json({ error: errMsg }, { status: 400 });
  }
}

