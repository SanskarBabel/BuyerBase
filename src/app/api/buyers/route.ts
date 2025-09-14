import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { buyers, buyerHistory } from '@/lib/db/schema';
import { createBuyerSchema, buyerFiltersSchema } from '@/lib/validations/buyer';
import { eq, and, or, ilike, desc, asc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = buyerFiltersSchema.parse({
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      search: searchParams.get('search') || undefined,
      city: searchParams.get('city') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      status: searchParams.get('status') || undefined,
      timeline: searchParams.get('timeline') || undefined,
      sortBy: searchParams.get('sortBy') || 'updatedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    const limit = 10;
    const offset = (filters.page - 1) * limit;

    // Build where conditions
    const conditions = [];
    
    if (filters.search) {
      conditions.push(
        or(
          ilike(buyers.fullName, `%${filters.search}%`),
          ilike(buyers.phone, `%${filters.search}%`),
          ilike(buyers.email, `%${filters.search}%`)
        )
      );
    }

    if (filters.city) {
      conditions.push(eq(buyers.city, filters.city));
    }

    if (filters.propertyType) {
      conditions.push(eq(buyers.propertyType, filters.propertyType));
    }

    if (filters.status) {
      conditions.push(eq(buyers.status, filters.status));
    }

    if (filters.timeline) {
      conditions.push(eq(buyers.timeline, filters.timeline));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Build order by
    const orderBy = filters.sortOrder === 'desc' 
      ? desc(buyers[filters.sortBy as keyof typeof buyers])
      : asc(buyers[filters.sortBy as keyof typeof buyers]);

    // Get buyers with pagination
    const buyersData = await db
      .select()
      .from(buyers)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(buyers)
      .where(whereClause);

    return NextResponse.json({
      data: buyersData,
      pagination: {
        page: filters.page,
        limit,
        total: Number(totalCount[0].count),
        pages: Math.ceil(Number(totalCount[0].count) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBuyerSchema.parse(body);

    const [newBuyer] = await db
      .insert(buyers)
      .values({
        ...validatedData,
        ownerId: session.user.id,
      })
      .returning();

    // Create history entry
    await db.insert(buyerHistory).values({
      buyerId: newBuyer.id,
      changedBy: session.user.id,
      diff: {
        created: { old: null, new: validatedData },
      },
    });

    return NextResponse.json(newBuyer, { status: 201 });
  } catch (error) {
    console.error('Error creating buyer:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}