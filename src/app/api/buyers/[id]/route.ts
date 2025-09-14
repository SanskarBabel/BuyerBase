import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { buyers, buyerHistory } from '@/lib/db/schema';
import { updateBuyerSchema } from '@/lib/validations/buyer';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, params.id))
      .limit(1);

    if (buyer.length === 0) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Get recent history
    const history = await db
      .select()
      .from(buyerHistory)
      .where(eq(buyerHistory.buyerId, params.id))
      .orderBy(buyerHistory.changedAt)
      .limit(5);

    return NextResponse.json({
      buyer: buyer[0],
      history,
    });
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateBuyerSchema.parse(body);

    // Get current buyer data for history
    const currentBuyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, params.id))
      .limit(1);

    if (currentBuyer.length === 0) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Check ownership
    if (currentBuyer[0].ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create diff for history
    const diff: Record<string, { old: any; new: any }> = {};
    Object.keys(validatedData).forEach((key) => {
      const oldValue = currentBuyer[0][key as keyof typeof currentBuyer[0]];
      const newValue = validatedData[key as keyof typeof validatedData];
      if (oldValue !== newValue) {
        diff[key] = { old: oldValue, new: newValue };
      }
    });

    // Update buyer
    const [updatedBuyer] = await db
      .update(buyers)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(buyers.id, params.id))
      .returning();

    // Create history entry if there are changes
    if (Object.keys(diff).length > 0) {
      await db.insert(buyerHistory).values({
        buyerId: params.id,
        changedBy: session.user.id,
        diff,
      });
    }

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error('Error updating buyer:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}