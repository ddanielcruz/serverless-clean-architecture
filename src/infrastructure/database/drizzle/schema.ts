import { index, pgTable, text, timestamp, real } from 'drizzle-orm/pg-core'

import type { AudioFormat } from '@/domain/notes/entities/audio'
import type { NoteStatus } from '@/domain/notes/entities/note'
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

export const ipAddresses = pgTable('ip_addresses', {
  id: text('id').notNull().primaryKey(),
  address: text('address').notNull().unique(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').notNull().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    ipAddressId: text('ip_address_id')
      .notNull()
      .references(() => ipAddresses.id),
    userAgent: text('user_agent').notNull(),
    invalidatedAt: timestamp('invalidated_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
    }
  },
)

export const audios = pgTable('audios', {
  id: text('id').notNull().primaryKey(),
  format: text('format').$type<AudioFormat>().notNull(),
  filename: text('filename').notNull(),
  duration: real('duration').notNull(),
})

export const notes = pgTable(
  'notes',
  {
    id: text('id').notNull().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    audioId: text('audio_id')
      .notNull()
      .references(() => audios.id),
    status: text('status').$type<NoteStatus>().notNull(),
    summary: text('summary'),
    transcription: text('transcription'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
      audioIdIdx: index().on(table.audioId),
    }
  },
)
