import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@platform/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    let targetTenantId = tenantId;
    if (!targetTenantId) {
      const firstTenant = await prisma.tenant.findFirst({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
      });
      if (firstTenant) targetTenantId = firstTenant.id;
    }

    if (!targetTenantId) {
      return NextResponse.json({ success: true, modules: [] });
    }

    const tenantModules = await prisma.tenantModule.findMany({
      where: { tenantId: targetTenantId },
    });

    return NextResponse.json({
      success: true,
      tenantId: targetTenantId,
      modules: tenantModules,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, moduleToken, isEnabled } = body;

    let targetTenantId = tenantId;
    if (!targetTenantId) {
      const firstTenant = await prisma.tenant.findFirst({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
      });
      if (firstTenant) targetTenantId = firstTenant.id;
    }

    if (!targetTenantId || !moduleToken) {
      return NextResponse.json(
        { error: 'tenantId and moduleToken are required.' },
        { status: 400 }
      );
    }

    const updated = await prisma.tenantModule.upsert({
      where: {
        tenantId_moduleToken: {
          tenantId: targetTenantId,
          moduleToken,
        },
      },
      update: {
        isEnabled: Boolean(isEnabled),
      },
      create: {
        tenantId: targetTenantId,
        moduleToken,
        isEnabled: Boolean(isEnabled),
      },
    });

    return NextResponse.json({
      success: true,
      module: updated,
    });
  } catch (error: any) {
    console.error('Tenant module toggle error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
