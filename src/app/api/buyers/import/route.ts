import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { buyers, buyerHistory } from '@/lib/db/schema';
import { csvImportSchema } from '@/lib/validations/csv';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data } = csvImportSchema.parse(body);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { row: number; errors: string[] }[],
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      try {
        const buyerData = {
          ...data[i],
          ownerId: session.user.id,
        };

        const [newBuyer] = await db
          .insert(buyers)
          .values(buyerData)
          .returning();

        // Create history entry
        await db.insert(buyerHistory).values({
          buyerId: newBuyer.id,
          changedBy: session.user.id,
          diff: {
            imported: { old: null, new: buyerData },
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error importing buyers:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}