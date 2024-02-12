import type { Session } from '@/domain/security/entities/session'
import type { SessionsRepository } from '@/domain/security/repositories/sessions-repository'

export class InMemorySessionsRepository implements SessionsRepository {
  readonly items: Session[] = []

  async create(session: Session): Promise<void> {
    this.items.push(session)
  }
}
