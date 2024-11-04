import { pgTable, integer, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  fullName: varchar({ length: 400 }).notNull(),
  username: varchar({ length: 255 }).unique().notNull(),
  password: varchar({ length: 255 }).notNull(),
});

export const tokensTable = pgTable("tokens", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  refreshToken: varchar({ length: 500 }).notNull(),
  userId: integer()
    .references(() => usersTable.id)
    .notNull(),
});
