import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@platform/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    if (!tenantId) {
      return NextResponse.json({ success: true, categories: [] });
    }

    const categories = await prisma.category.findMany({
      where: { tenantId },
      include: {
        menuItems: {
          include: { variants: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getCategoryCourseRank(name: string): number {
  const n = (name || '').toLowerCase().trim();
  if (n.includes('appetizer') || n.includes('starter') || n.includes('soup') || n.includes('salad') || n.includes('snack') || n.includes('chaat')) return 1;
  if (n.includes('main') || n.includes('curry') || n.includes('biryani') || n.includes('gravy') || n.includes('entree') || n.includes('rice') || n.includes('pasta') || n.includes('pizza') || n.includes('burger')) return 2;
  if (n.includes('bread') || n.includes('roti') || n.includes('naan') || n.includes('paratha') || n.includes('side')) return 3;
  if (n.includes('dessert') || n.includes('sweet') || n.includes('ice cream') || n.includes('cake') || n.includes('pastry') || n.includes('halwa')) return 4;
  if (n.includes('drink') || n.includes('beverage') || n.includes('juice') || n.includes('shake') || n.includes('tea') || n.includes('coffee') || n.includes('soda') || n.includes('water')) return 5;
  return 10;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantId,
      name,
      categoryName,
      basePrice,
      foodType = 'VEG',
      taxRatePercent = 5,
      description,
      items,
    } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required.' },
        { status: 400 }
      );
    }

    // Bulk creation support
    if (Array.isArray(items) && items.length > 0) {
      const createdItems = [];
      for (const it of items) {
        if (!it.name || it.price === undefined && it.basePrice === undefined) continue;
        const catName = (it.category || it.categoryName || 'General').trim();
        const priceVal = Number(it.price ?? it.basePrice ?? 0);

        let category = await prisma.category.findFirst({
          where: {
            tenantId,
            name: { equals: catName, mode: 'insensitive' },
          },
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              tenantId,
              name: catName,
              sortOrder: getCategoryCourseRank(catName),
            },
          });
        }

        const foodTypeValue = it.foodType === 'NON_VEG' ? 'NON_VEG' : 'VEG';
        const itemCount = await prisma.menuItem.count({ where: { categoryId: category.id } });

        const created = await prisma.menuItem.create({
          data: {
            tenantId,
            categoryId: category.id,
            name: it.name,
            description: it.description || null,
            basePrice: Math.round(priceVal * 100),
            foodType: foodTypeValue as any,
            taxRatePercent: 5,
            sortOrder: itemCount + 1,
            isAvailable: true,
          },
        });
        createdItems.push(created);
      }

      return NextResponse.json({ success: true, count: createdItems.length, items: createdItems });
    }

    if (!name || !basePrice) {
      return NextResponse.json(
        { error: 'name and basePrice are required.' },
        { status: 400 }
      );
    }

    const catName = (categoryName || 'Main Course').trim();
    let category = await prisma.category.findFirst({
      where: {
        tenantId,
        name: { equals: catName, mode: 'insensitive' },
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          tenantId,
          name: catName,
          sortOrder: getCategoryCourseRank(catName),
        },
      });
    }

    const itemCount = await prisma.menuItem.count({ where: { categoryId: category.id } });

    // 2. Create MenuItem
    const menuItem = await prisma.menuItem.create({
      data: {
        tenantId,
        categoryId: category.id,
        name,
        description: description || null,
        basePrice: Math.round(Number(basePrice) * 100), // convert to paise
        foodType: foodType as any,
        taxRatePercent: Number(taxRatePercent) || 5,
        sortOrder: itemCount + 1,
        isAvailable: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, menuItem });
  } catch (error: any) {
    console.error('Menu item creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
