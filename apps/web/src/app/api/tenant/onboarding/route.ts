import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@platform/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantId,
      businessType = 'RESTAURANT',
      businessName,
      phone,
      email,
      address,
      city,
      state,
      country = 'IN',
      currency = 'INR',
      timezone = 'Asia/Kolkata',
      logoUrl,
      services = [],
      modules = [],
      hasTables = false,
      tableCount = 0,
      tableSections = [],
      hasEmployees = false,
      employees = [],
      billingConfig = {
        taxRate: 5,
        serviceCharge: 0,
        roundOff: true,
        invoicePrefix: 'INV-',
      },
      printerConfig = {
        type: 'THERMAL',
        kotPrinter: false,
      },
      initialMenu = [],
    } = body;

    // Resolve tenant
    let targetTenantId = tenantId;
    if (!targetTenantId) {
      const firstTenant = await prisma.tenant.findFirst({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
      });
      if (!firstTenant) {
        return NextResponse.json({ error: 'No active tenant found to onboard.' }, { status: 404 });
      }
      targetTenantId = firstTenant.id;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Tenant businessType
      await tx.tenant.update({
        where: { id: targetTenantId },
        data: {
          businessType: businessType as any,
          status: 'APPROVED', // Ensure approved upon onboarding
        },
      });

      // 2. Upsert BusinessProfile
      const profile = await tx.businessProfile.upsert({
        where: { tenantId: targetTenantId },
        update: {
          businessName: businessName || 'My Restaurant',
          phone: phone || '',
          email: email || '',
          address: address || '',
          city: city || 'Bengaluru',
          state: state || 'Karnataka',
          country: country || 'IN',
          currencyCode: currency || 'INR',
          currencySymbol: currency === 'USD' ? '$' : '₹',
          timezone: timezone || 'Asia/Kolkata',
          logoUrl: logoUrl || null,
          onboardingCompleted: true,
        },
        create: {
          tenantId: targetTenantId,
          businessName: businessName || 'My Restaurant',
          phone: phone || '',
          email: email || '',
          address: address || '',
          city: city || 'Bengaluru',
          state: state || 'Karnataka',
          country: country || 'IN',
          currencyCode: currency || 'INR',
          currencySymbol: currency === 'USD' ? '$' : '₹',
          timezone: timezone || 'Asia/Kolkata',
          logoUrl: logoUrl || null,
          onboardingCompleted: true,
        },
      });

      // 3. Upsert Modules
      if (Array.isArray(modules) && modules.length > 0) {
        for (const mod of modules) {
          await tx.tenantModule.upsert({
            where: {
              tenantId_moduleToken: {
                tenantId: targetTenantId,
                moduleToken: String(mod).toUpperCase(),
              },
            },
            update: { isEnabled: true },
            create: {
              tenantId: targetTenantId,
              moduleToken: String(mod).toUpperCase(),
              isEnabled: true,
            },
          });
        }
      }

      // 4. Configure Tables if enabled
      if (hasTables && tableCount > 0) {
        // Create table sections
        const createdSections: any[] = [];
        for (let i = 0; i < tableSections.length; i++) {
          const sName = tableSections[i];
          const section = await tx.tableSection.create({
            data: {
              tenantId: targetTenantId,
              name: sName,
              sortOrder: i,
            },
          });
          createdSections.push(section);
        }

        // Create tables distributed across sections
        const tablesPerSection = Math.ceil(tableCount / (createdSections.length || 1));
        let tableIndex = 1;
        for (const sec of createdSections) {
          for (let j = 0; j < tablesPerSection && tableIndex <= tableCount; j++) {
            await tx.table.create({
              data: {
                tenantId: targetTenantId,
                sectionId: sec.id,
                tableNumber: `T${tableIndex}`,
                tableName: `Table ${tableIndex}`,
                capacity: tableIndex % 3 === 0 ? 6 : tableIndex % 2 === 0 ? 4 : 2,
                status: 'AVAILABLE',
                sortOrder: tableIndex,
              },
            });
            tableIndex++;
          }
        }
      }

      // 5. Store Billing & Printer Settings
      await tx.restaurantSetting.upsert({
        where: {
          tenantId_key: {
            tenantId: targetTenantId,
            key: 'billing_config',
          },
        },
        update: { valueJson: billingConfig },
        create: {
          tenantId: targetTenantId,
          key: 'billing_config',
          valueJson: billingConfig,
        },
      });

      await tx.restaurantSetting.upsert({
        where: {
          tenantId_key: {
            tenantId: targetTenantId,
            key: 'printer_config',
          },
        },
        update: { valueJson: printerConfig },
        create: {
          tenantId: targetTenantId,
          key: 'printer_config',
          valueJson: printerConfig,
        },
      });

      await tx.restaurantSetting.upsert({
        where: {
          tenantId_key: {
            tenantId: targetTenantId,
            key: 'services_config',
          },
        },
        update: { valueJson: services },
        create: {
          tenantId: targetTenantId,
          key: 'services_config',
          valueJson: services,
        },
      });

      // 6. Seed initial menu items if passed from AI import
      if (Array.isArray(initialMenu) && initialMenu.length > 0) {
        for (const catData of initialMenu) {
          const category = await tx.category.create({
            data: {
              tenantId: targetTenantId,
              name: catData.category || 'General',
            },
          });

          if (Array.isArray(catData.items)) {
            for (const it of catData.items) {
              await tx.menuItem.create({
                data: {
                  tenantId: targetTenantId,
                  categoryId: category.id,
                  name: it.name,
                  description: it.description || '',
                  basePrice: Math.round(Number(it.price || 100) * 100), // in cents / paise
                  foodType: it.isVeg ? 'VEG' : 'NON_VEG',
                  isAvailable: true,
                },
              });
            }
          }
        }
      }

      // 7. Audit Log
      const ownerUser = await tx.user.findFirst({
        where: { tenantId: targetTenantId },
      });

      if (ownerUser) {
        await tx.auditLog.create({
          data: {
            tenantId: targetTenantId,
            userId: ownerUser.id,
            userName: ownerUser.fullName,
            action: 'COMPLETE_ONBOARDING',
            entityType: 'TENANT',
            entityId: targetTenantId,
            metadataJson: {
              businessName,
              businessType,
              hasTables,
              tableCount,
              logoUrl,
            },
          },
        });
      }

      return { profile };
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding configuration successfully saved to PostgreSQL database.',
      profile: result.profile,
      tenantId: targetTenantId,
    });
  } catch (error: any) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding.', details: error.message },
      { status: 500 }
    );
  }
}
