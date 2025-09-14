import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { BuyerForm } from '@/components/buyer-form';
import { CreateBuyerData } from '@/lib/validations/buyer';

async function createBuyer(data: CreateBuyerData) {
  'use server';
  
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/buyers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create buyer');
  }

  return response.json();
}

export default async function NewBuyerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto py-8">
      <BuyerForm onSubmit={createBuyer} />
    </div>
  );
}