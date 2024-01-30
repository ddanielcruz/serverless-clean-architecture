import 'dotenv/config'

import { migrate } from 'drizzle-orm/node-postgres/migrator'

import { Database } from '../database'

async function runMigrations() {
  const start = Date.now()
  console.log('🚀 Migrating database')

  await migrate(Database.instance, { migrationsFolder: './drizzle' })

  console.log(`✅ Done in ${Date.now() - start}ms`)
  await Database.disconnect()
}

runMigrations().catch((error) => {
  console.error(error)
  process.exit(1)
})
