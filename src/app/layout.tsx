import './globals.css';
import type { Metadata } from 'next/font/google';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { SessionProvider } from '@/components/session-provider';
import { Navigation } from '@/components/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Buyer Lead Management - CRM',
  description: 'Comprehensive buyer lead management system for real estate professionals',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {session && <Navigation />}
          <main className={session ? 'pt-16' : ''}>
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}