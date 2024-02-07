import { CreateSession } from '@/domain/security/services/create-session'
import { ConfirmToken } from '@/domain/users/services/confirm-token'
import { JsonWebTokenAdapter } from '@/infrastructure/cryptography/jsonwebtoken-adapter'
import { DrizzleConfirmationTokensRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-confirmation-tokens-repository'
import { DrizzleUsersRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-users-repository'

import { ConfirmTokenController } from './confirm-token-controller'
import { applyMiddleware } from '../../middleware/apply-middleware'
import type { HttpController } from '../../protocols/http-controller'

export function makeConfirmTokenController(): HttpController {
  const drizzleConfirmationTokensRepository =
    new DrizzleConfirmationTokensRepository()
  const drizzleUsersRepository = new DrizzleUsersRepository()
  const jwtAdapter = new JsonWebTokenAdapter()
  const createSession = new CreateSession(jwtAdapter)
  const confirmToken = new ConfirmToken(
    drizzleConfirmationTokensRepository,
    drizzleUsersRepository,
    createSession,
  )
  const confirmTokenController = new ConfirmTokenController(confirmToken)

  return applyMiddleware(confirmTokenController)
}
