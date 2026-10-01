import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@platform/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    if (!tenantId) {
      return NextResponse.json({ success: true, tables: [] });
    }

    const tables = await prisma.table.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, tables });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, tableNumber, tableName, capacity = 4, status = 'AVAILABLE' } = body;

    if (!tenantId || !tableNumber || !tableName) {
      return NextResponse.json(
        { error: 'tenantId, tableNumber, and tableName are required.' },
        { status: 400 }
      );
    }

    const table = await prisma.table.upsert({
      where: {
        tenantId_tableNumber: {
          tenantId,
          tableNumber,
        },
      },
      update: {
        tableName,
        capacity: Number(capacity),
        status,
      },
      create: {
        tenantId,
        tableNumber,
        tableName,
        capacity: Number(capacity),
        status,
      },
    });

    return NextResponse.json({ success: true, table });
  } catch (error: any) {
    console.error('Table creation/update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableId, status } = body;

    if (!tableId || !status) {
      return NextResponse.json({ error: 'tableId and status are required' }, { status: 400 });
    }

    const table = await prisma.table.update({
      where: { id: tableId },
      data: { status: status as any },
    });

    return NextResponse.json({ success: true, table });
  } catch (error: any) {
    console.error('Table status update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
