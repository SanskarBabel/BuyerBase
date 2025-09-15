import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Buyer = typeof schema.buyers.$inferSelect;
export type NewBuyer = typeof schema.buyers.$inferInsert;
export type BuyerHistory = typeof schema.buyerHistory.$inferSelect;
export type NewBuyerHistory = typeof schema.buyerHistory.$inferInsert;