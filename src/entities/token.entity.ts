import { pgTable, integer, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./user.entity";

export const tokensTable = pgTable("tokens", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  refreshToken: varchar({ length: 500 }).notNull(),
  userId: integer()
    .references(() => usersTable.id)
    .notNull(),
});
