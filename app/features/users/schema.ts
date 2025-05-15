import {
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

const users = pgSchema('auth').table('users', {
  id: uuid().primaryKey(),
});

export const roles = pgEnum('role', ['ceo', 'manager', 'employee']);

export const profiles = pgTable('profiles', {
  profile_id: uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  username: text().notNull(),
  avatar_url: text(),
  role: roles().default('employee').notNull(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});
