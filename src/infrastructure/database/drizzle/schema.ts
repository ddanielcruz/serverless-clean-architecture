import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import type { ConfirmationTokenType } from '@/domain/users/entities/confirmation-token'

export const users = pgTable('users', {
  id: text('id').notNull().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerifiedAt: timestamp('email_verified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const confirmationTokens = pgTable(
  'confirmation_tokens',
  {
    id: text('id').notNull().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    token: text('token').notNull().unique(),
    type: text('type').$type<ConfirmationTokenType>().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
    }
  },
)
