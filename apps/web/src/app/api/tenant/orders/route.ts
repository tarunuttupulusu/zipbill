import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@platform/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    if (!tenantId) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: { tenantId },
      include: {
        items: true,
        table: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantId,
      orderType = 'DINE_IN',
      tableId,
      guestCount = 2,
      subtotal = 0,
      taxAmount = 0,
      discountAmount = 0,
      grandTotal = 0,
      items = [],
      status = 'PLACED',
      createdByWorkerId,
      createdByWorkerName,
      deviceId = 'device-pos-01',
    } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required.' }, { status: 400 });
    }

    const orderCount = await prisma.order.count({ where: { tenantId } });
    const orderNumber = `ORD-${String(orderCount + 1).padStart(4, '0')}`;

    // Ensure all items reference valid MenuItem IDs for this tenant
    const processedItems = await Promise.all(
      items.map(async (item: any) => {
        let validMenuItemId = item.menuItemId || item.id;
        let menuItem = null;
        if (validMenuItemId) {
          menuItem = await prisma.menuItem.findFirst({
            where: { id: validMenuItemId, tenantId },
          });
        }
        if (!menuItem) {
          // Check if any menuItem exists for this tenant
          menuItem = await prisma.menuItem.findFirst({
            where: { tenantId },
          });
          if (!menuItem) {
            let category = await prisma.category.findFirst({ where: { tenantId } });
            if (!category) {
              category = await prisma.category.create({
                data: {
                  tenantId,
                  name: 'General',
                },
              });
            }
            menuItem = await prisma.menuItem.create({
              data: {
                tenantId,
                categoryId: category.id,
                name: item.name || item.itemName || 'Custom Item',
                basePrice: Math.round(Number(item.price || item.unitPrice || 100)),
                foodType: 'VEG',
              },
            });
          }
        }

        const unitPrice = Math.round(Number(item.price || item.unitPrice || menuItem.basePrice));
        const quantity = Number(item.quantity) || 1;
        const subtotal = Math.round(Number(item.subtotal || (quantity * unitPrice)));

        return {
          menuItemId: menuItem.id,
          itemName: item.name || item.itemName || menuItem.name,
          quantity,
          unitPrice,
          subtotal,
          notes: item.notes || null,
          status: 'PLACED' as const,
          addedByWorkerId: createdByWorkerId || 'usr-worker-01',
          addedByWorkerName: createdByWorkerName || 'Server',
        };
      })
    );

    const order = await prisma.order.create({
      data: {
        tenantId,
        orderNumber,
        orderType: orderType as any,
        tableId: tableId || null,
        guestCount: Number(guestCount),
        subtotal: Math.round(Number(subtotal)),
        taxAmount: Math.round(Number(taxAmount)),
        discountAmount: Math.round(Number(discountAmount)),
        grandTotal: Math.round(Number(grandTotal)),
        status: status as any,
        createdByWorkerId: createdByWorkerId || 'usr-worker-01',
        createdByWorkerName: createdByWorkerName || 'Server',
        deviceId: deviceId || 'dev-terminal-01',
        items: {
          create: processedItems,
        },
      },
      include: {
        items: true,
        table: true,
      },
    });

    // If table assigned, update table status to OCCUPIED
    if (tableId) {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: { items: true, table: true },
    });

    if (order.tableId && (status === 'COMPLETED' || status === 'CANCELLED')) {
      const remainingOrders = await prisma.order.count({
        where: {
          tableId: order.tableId,
          status: { in: ['PLACED', 'PREPARING', 'READY', 'SERVED'] },
        },
      });
      if (remainingOrders === 0) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE' },
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Order status update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
