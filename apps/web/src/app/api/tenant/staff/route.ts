import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@platform/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    if (!tenantId) {
      return NextResponse.json({ success: true, staff: [] });
    }

    const staff = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        roleType: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, name, email, phone, role } = body;

    if (!tenantId || !name || !email) {
      return NextResponse.json(
        { error: 'tenantId, name, and email are required.' },
        { status: 400 }
      );
    }

    const roleType = role === 'KITCHEN' ? 'KITCHEN' : 'WAITER';

    // Upsert or create user for this tenant
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    let staffMember;
    if (existing) {
      staffMember = await prisma.user.update({
        where: { id: existing.id },
        data: {
          fullName: name,
          phone: phone || existing.phone,
          roleType: roleType as any,
          tenantId,
        },
      });
    } else {
      staffMember = await prisma.user.create({
        data: {
          tenantId,
          email,
          fullName: name,
          phone: phone || null,
          roleType: roleType as any,
          isActive: true,
        },
      });
    }

    return NextResponse.json({ success: true, staff: staffMember });
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

    await prisma.user.deleteMany({
      where: { id, tenantId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
