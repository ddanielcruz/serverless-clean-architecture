import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

import type { Session } from '../entities/session'

export interface SessionsRepository {
  create(session: Session): Promise<void>
  invalidate(sessionId: UniqueEntityId): Promise<boolean>
}
