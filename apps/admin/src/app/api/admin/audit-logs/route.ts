import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@platform/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit') || 50);

    const logs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        tenant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({
        id: l.id,
        tenantId: l.tenantId,
        tenantName: l.tenant?.name || 'Platform System',
        userId: l.userId,
        userName: l.userName,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        metadata: l.metadataJson,
        timestamp: l.timestamp.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Audit log fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
