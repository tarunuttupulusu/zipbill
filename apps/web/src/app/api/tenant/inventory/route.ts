import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@platform/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    if (!tenantId) {
      return NextResponse.json({ success: true, inventory: [] });
    }

    const inventory = await prisma.inventoryItem.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      take: 100,
    });

    return NextResponse.json({ success: true, inventory });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, name, unit = 'kg', currentStock = 0, minThreshold = 5, costPerUnit = 0 } = body;

    if (!tenantId || !name) {
      return NextResponse.json(
        { error: 'tenantId and name are required.' },
        { status: 400 }
      );
    }

    const item = await prisma.inventoryItem.upsert({
      where: {
        tenantId_name: {
          tenantId,
          name,
        },
      },
      update: {
        unit,
        currentStock: Number(currentStock),
        minAlertStock: Number(minThreshold),
        costPerUnit: Math.round(Number(costPerUnit)),
      },
      create: {
        tenantId,
        name,
        unit,
        currentStock: Number(currentStock),
        minAlertStock: Number(minThreshold),
        costPerUnit: Math.round(Number(costPerUnit)),
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const tenantId = searchParams.get('tenantId');

    if (!id || !tenantId) {
      return NextResponse.json(
        { error: 'id and tenantId are required.' },
        { status: 400 }
      );
    }

    await prisma.inventoryItem.deleteMany({
      where: { id, tenantId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
