import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { buyers } from '@/lib/db/schema';
import { BuyersTable } from '@/components/buyers-table';
import { buyerFiltersSchema } from '@/lib/validations/buyer';
import { and, or, ilike, desc, asc, sql } from 'drizzle-orm';

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  // Parse and validate search params
  const filters = buyerFiltersSchema.parse({
    page: searchParams.page ? Number(searchParams.page) : 1,
    search: searchParams.search || undefined,
    city: searchParams.city || undefined,
    propertyType: searchParams.propertyType || undefined,
    status: searchParams.status || undefined,
    timeline: searchParams.timeline || undefined,
    sortBy: searchParams.sortBy || 'updatedAt',
    sortOrder: searchParams.sortOrder || 'desc',
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
    conditions.push(buyers.city.eq(filters.city as any));
  }

  if (filters.propertyType) {
    conditions.push(buyers.propertyType.eq(filters.propertyType as any));
  }

  if (filters.status) {
    conditions.push(buyers.status.eq(filters.status as any));
  }

  if (filters.timeline) {
    conditions.push(buyers.timeline.eq(filters.timeline as any));
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

  const pagination = {
    page: filters.page,
    limit,
    total: Number(totalCount[0].count),
    pages: Math.ceil(Number(totalCount[0].count) / limit),
  };

  return (
    <div className="container mx-auto py-8">
      <BuyersTable buyers={buyersData} pagination={pagination} />
    </div>
  );
}