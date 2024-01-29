import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { config } from '@/core/config'

export const pool = new Pool({ connectionString: config.get('DATABASE_URL') })
export const db = drizzle(pool)
