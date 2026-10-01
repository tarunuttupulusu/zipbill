import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@platform/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required for OAuth synchronization.' },
        { status: 400 }
      );
    }

    const cleanName = fullName || email.split('@')[0] || 'User';

    // 1. Check if user already exists in PostgreSQL
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { authUserId: userId }, { email }],
      },
      include: {
        tenant: {
          include: {
            businessProfile: true,
            modules: true,
          },
        },
      },
    });

    if (user && user.tenant) {
      // User and restaurant already exist
      return NextResponse.json({
        success: true,
        isNew: false,
        tenant: user.tenant,
        profile: user.tenant.businessProfile,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roleType: user.roleType,
          tenantId: user.tenantId,
        },
      });
    }

    // 2. First-time login: Create clean restaurant workspace for this user
    const restaurantName = `${cleanName}'s Restaurant`;
    const baseSlug = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ensure Profile record exists first in public.profiles for foreign key constraints
      await tx.$executeRawUnsafe(
        `INSERT INTO public.profiles (id, full_name, phone, created_at, updated_at)
         VALUES ($1::uuid, $2, '', NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name`,
        userId,
        cleanName
      );

      // 2. Create Tenant with APPROVED status
      const tenant = await tx.tenant.create({
        data: {
          slug,
          name: restaurantName,
          businessType: 'RESTAURANT',
          status: 'APPROVED',
        },
      });

      // 3. Update owner_user_id on Tenant
      await tx.$executeRawUnsafe(
        `UPDATE public."Tenant" SET owner_user_id = $1::uuid WHERE id = $2`,
        userId,
        tenant.id
      );

      // 4. Create BusinessProfile
      const profile = await tx.businessProfile.create({
        data: {
          tenantId: tenant.id,
          businessName: restaurantName,
          phone: '',
          email,
          address: '',
          city: '',
          state: '',
          country: 'IN',
          currencyCode: 'INR',
          currencySymbol: '₹',
          timezone: 'Asia/Kolkata',
          onboardingCompleted: false,
        },
      });

      // 5. Update user_id on BusinessProfile
      await tx.$executeRawUnsafe(
        `UPDATE public."BusinessProfile" SET user_id = $1::uuid WHERE id = $2`,
        userId,
        profile.id
      );

      // 6. Create the 3 linked roles for this restaurant: OWNER, WAITER, KITCHEN
      const ownerRole = await tx.role.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name: 'OWNER' } },
        update: {},
        create: {
          tenantId: tenant.id,
          name: 'OWNER',
          description: 'Restaurant Owner with full administrative control',
          isSystem: true,
          permissions: ['*'],
        },
      });

      const waiterRole = await tx.role.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name: 'WAITER' } },
        update: {},
        create: {
          tenantId: tenant.id,
          name: 'WAITER',
          description: 'Floor Waiter with POS and order management privileges',
          isSystem: true,
          permissions: [
            'dashboard.view',
            'dashboard.tables',
            'dashboard.orders',
            'pos.*',
            'tables.*',
            'orders.*',
            'menu.view',
            'customers.view',
            'sync.*',
          ],
        },
      });

      const kitchenRole = await tx.role.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name: 'KITCHEN' } },
        update: {},
        create: {
          tenantId: tenant.id,
          name: 'KITCHEN',
          description: 'Kitchen preparation staff with KDS queue access',
          isSystem: true,
          permissions: [
            'kitchen.*',
            'orders.view',
            'orders.details',
            'sync.*',
          ],
        },
      });

      // 7. Create Owner User
      const newUser = await tx.user.upsert({
        where: { email },
        update: {
          id: userId,
          authUserId: userId,
          tenantId: tenant.id,
          roleType: 'OWNER',
          roleId: ownerRole.id,
        },
        create: {
          id: userId,
          authUserId: userId,
          tenantId: tenant.id,
          email,
          fullName: cleanName,
          roleType: 'OWNER',
          roleId: ownerRole.id,
          isActive: true,
        },
      });

      // 8. Create Linked Floor Waiter User for this Restaurant
      await tx.user.upsert({
        where: { email: `waiter@${slug}.pos` },
        update: { tenantId: tenant.id, roleId: waiterRole.id },
        create: {
          tenantId: tenant.id,
          email: `waiter@${slug}.pos`,
          fullName: `Floor Waiter (${restaurantName})`,
          roleType: 'WAITER',
          roleId: waiterRole.id,
          isActive: true,
        },
      });

      // 9. Create Linked Kitchen Chef User for this Restaurant
      await tx.user.upsert({
        where: { email: `kitchen@${slug}.pos` },
        update: { tenantId: tenant.id, roleId: kitchenRole.id },
        create: {
          tenantId: tenant.id,
          email: `kitchen@${slug}.pos`,
          fullName: `Kitchen Chef (${restaurantName})`,
          roleType: 'KITCHEN',
          roleId: kitchenRole.id,
          isActive: true,
        },
      });

      // Create RestaurantMember relationship
      await tx.restaurantMember.upsert({
        where: {
          tenantId_userId: {
            tenantId: tenant.id,
            userId,
          },
        },
        update: { role: 'OWNER' },
        create: {
          tenantId: tenant.id,
          userId,
          role: 'OWNER',
          roleId: ownerRole.id,
          isActive: true,
        },
      });

      // Enable default platform modules for clean restaurant workspace
      const defaultModules = [
        'pos.dine_in', 'pos.quick_counter', 'operations.tables', 'operations.kitchen_kds',
        'catalog.modifiers_variants', 'billing.thermal_receipts', 'payments.upi_qr',
        'staff.shared_access', 'inventory.raw_materials', 'reports.sales_analytics'
      ];
      for (const token of defaultModules) {
        await tx.tenantModule.upsert({
          where: { tenantId_moduleToken: { tenantId: tenant.id, moduleToken: token } },
          update: { isEnabled: true },
          create: { tenantId: tenant.id, moduleToken: token, isEnabled: true },
        });
      }

      // Create RegistrationRequest (approved)
      await tx.registrationRequest.create({
        data: {
          tenantId: tenant.id,
          applicantName: cleanName,
          applicantEmail: email,
          applicantPhone: '',
          businessType: 'RESTAURANT',
          status: 'APPROVED',
          intendedModules: defaultModules,
        },
      });

      return { tenant, profile, user: newUser };
    });

    return NextResponse.json({
      success: true,
      isNew: true,
      tenant: result.tenant,
      profile: result.profile,
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        roleType: result.user.roleType,
        tenantId: result.user.tenantId,
      },
    });
  } catch (error: any) {
    console.error('OAuth sync error:', error);
    return NextResponse.json(
      { error: 'Failed to synchronize OAuth user profile.', details: error.message },
      { status: 500 }
    );
  }
}
