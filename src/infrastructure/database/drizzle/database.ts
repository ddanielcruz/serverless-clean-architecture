import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { config } from '@/core/config'

export class Database {
  private static _pool: Pool | null = null
  private static _instance: NodePgDatabase | null = null

  private constructor() {}

  static get instance(): NodePgDatabase {
    if (!this._instance) {
      this._pool = new Pool({ connectionString: config.get('DATABASE_URL') })
      this._instance = drizzle(this._pool)
    }

    return this._instance as NodePgDatabase
  }

  static async disconnect(): Promise<void> {
    if (this._pool) {
      await this._pool.end()

      this._pool = null
      this._instance = null
    }
  }
}
