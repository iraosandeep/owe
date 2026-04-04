import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  personName: text("person_name").notNull(),
  phone: text("phone"),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["given", "taken"] }).notNull(),
  interest: real("interest"),
  date: text("date").notNull(),
  createdAt: text("created_at").notNull(),
});
