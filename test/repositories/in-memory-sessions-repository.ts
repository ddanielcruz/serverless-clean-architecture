import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Session } from '@/domain/security/entities/session'
import type { SessionsRepository } from '@/domain/security/repositories/sessions-repository'

export class InMemorySessionsRepository implements SessionsRepository {
  readonly items: Session[] = []

  async create(session: Session): Promise<void> {
    this.items.push(session)
  }

  async invalidate(sessionId: UniqueEntityId): Promise<boolean> {
    const session = this.items.find((s) => s.id.equals(sessionId))
    if (!session) {
      return false
    }

    session.invalidate()

    return true
  }
}
