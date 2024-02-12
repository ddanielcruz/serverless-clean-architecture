import type { Session } from '@/domain/security/entities/session'
import type { SessionsRepository } from '@/domain/security/repositories/sessions-repository'

import { Database } from '../database'
import { DrizzleSessionMapper } from '../mappers/drizzle-session-mapper'
import * as s from '../schema'

export class DrizzleSessionsRepository implements SessionsRepository {
  private readonly db = Database.instance

  async create(session: Session): Promise<void> {
    await this.db
      .insert(s.sessions)
      .values(DrizzleSessionMapper.toDrizzle(session))
  }
}
