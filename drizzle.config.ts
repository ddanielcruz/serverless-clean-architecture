import 'dotenv/config'
import type { Config } from 'drizzle-kit'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined.')
}

export default {
  schema: './src/infrastructure/database/drizzle/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: DATABASE_URL,
  },
} satisfies Config
