import { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        // Check if user exists, if not create them
        const existingUser = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
        
        if (existingUser.length === 0) {
          await db.insert(users).values({
            email: user.email,
            name: user.name || undefined,
          });
        }
        return true;
      }
      return false;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
        if (dbUser.length > 0) {
          session.user.id = dbUser[0].id;
          session.user.name = dbUser[0].name || session.user.name;
        }
      }
      return session;
    },
  },
};