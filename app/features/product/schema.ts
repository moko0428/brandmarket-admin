import { bigint, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { profiles } from '../\busers/schema';

export const shops = pgTable('shops', {
  shop_id: uuid().primaryKey(),
  name: text().notNull(),
});

export const products = pgTable('products', {
  product_id: bigint({ mode: 'number' })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  name: text().notNull(),
  shop_id: uuid()
    .references(() => shops.shop_id, { onDelete: 'cascade' })
    .notNull(),
  price: bigint({ mode: 'number' }).notNull(),
  quantity: bigint({ mode: 'number' }).notNull(),
  total: bigint({ mode: 'number' }).notNull(),
  profile_id: uuid()
    .references(() => profiles.profile_id, { onDelete: 'cascade' })
    .notNull(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});
