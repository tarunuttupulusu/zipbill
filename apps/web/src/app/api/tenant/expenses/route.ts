import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@platform/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    if (!tenantId) {
      return NextResponse.json({ success: true, expenses: [] });
    }

    const expenses = await prisma.expense.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, expenses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantId,
      category = 'RAW_MATERIALS',
      amount,
      paymentMode = 'UPI',
      notes,
      recordedBy = 'Staff',
    } = body;

    if (!tenantId || !amount) {
      return NextResponse.json(
        { error: 'tenantId and amount are required.' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        tenantId,
        category: category as any,
        amount: Math.round(Number(amount) * 100), // in paise
        paymentMode: paymentMode || 'UPI',
        notes: notes || null,
        recordedBy: recordedBy || 'Manager',
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
