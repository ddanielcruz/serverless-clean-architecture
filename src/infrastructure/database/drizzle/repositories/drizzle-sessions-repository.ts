import { eq } from 'drizzle-orm'

import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
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

  async invalidate(sessionId: UniqueEntityId): Promise<boolean> {
    const output = await this.db
      .update(s.sessions)
      .set({ invalidatedAt: new Date() })
      .where(eq(s.sessions.id, sessionId.value))

    return (output.rowCount ?? 0) > 0
  }
}
