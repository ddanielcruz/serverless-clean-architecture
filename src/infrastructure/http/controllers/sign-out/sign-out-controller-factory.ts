import { InvalidateSession } from '@/domain/security/services/invalidate-session'
import { DrizzleSessionsRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-sessions-repository'

import { SignOutController } from './sign-out-controller'
import { applyMiddleware } from '../../middleware/apply-middleware'

export function makeSignOutController() {
  const drizzleSessionsRepo = new DrizzleSessionsRepository()
  const invalidateSession = new InvalidateSession(drizzleSessionsRepo)
  const controller = new SignOutController(invalidateSession)

  return applyMiddleware(controller)
}
