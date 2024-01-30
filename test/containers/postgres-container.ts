import { execSync } from 'node:child_process'

import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'

const POSTGRES_IMAGE = 'postgres:16'

class PostgresContainer {
  private container: StartedPostgreSqlContainer | null = null

  async start(): Promise<void> {
    // Start Postgres container
    this.container = await new PostgreSqlContainer(POSTGRES_IMAGE).start()
    process.env.DATABASE_URL = this.container.getConnectionUri()

    // Run database migrations
    execSync('npm run migrations:push', { env: process.env })
  }

  async stop(): Promise<void> {
    await this.container?.stop()
  }
}

export const postgresContainer = new PostgresContainer()
