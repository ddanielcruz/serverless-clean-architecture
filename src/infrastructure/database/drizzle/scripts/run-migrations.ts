import 'dotenv/config'

import { migrate } from 'drizzle-orm/node-postgres/migrator'

import { db, pool } from '../connection'

async function runMigrations() {
  const start = Date.now()
  console.log('🚀 Migrating database')

  await migrate(db, { migrationsFolder: './drizzle' })

  console.log(`✅ Done in ${Date.now() - start}ms`)
  await pool.end()
}

runMigrations().catch((error) => {
  console.error(error)
  process.exit(1)
})
