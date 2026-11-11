import { pgTable, text, boolean, jsonb } from 'drizzle-orm/pg-core';
export const profiles = pgTable('profiles', {
  userId: text('user_id').primaryKey(),
  fullName: text('full_name').notNull().default(''),
  phone: text('phone').notNull().default(''),
  currency: text('currency').notNull().default('KSh'),
  photoKey: text('photo_key'),
  hideAmounts: boolean('hide_amounts').notNull().default(false),
  finances: jsonb('finances').notNull().default({ monthlyBudget: 0, expenses: [] }),
});
