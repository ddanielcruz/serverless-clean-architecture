import type { Session } from '../entities/session'

export interface SessionsRepository {
  create(session: Session): Promise<void>
}
