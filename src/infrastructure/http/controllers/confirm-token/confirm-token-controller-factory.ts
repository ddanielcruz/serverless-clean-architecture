import { ConfirmToken } from '@/domain/security/services/confirm-token'
import { CreateSession } from '@/domain/security/services/create-session'
import { LocateIpAddress } from '@/domain/security/services/locate-ip-address'
import { VerifyUserEmail } from '@/domain/users/services/verify-user-email'
import { AxiosAdapter } from '@/infrastructure/axios/axios-adapter'
import { JsonWebTokenAdapter } from '@/infrastructure/cryptography/jsonwebtoken-adapter'
import { DrizzleConfirmationTokensRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-confirmation-tokens-repository'
import { DrizzleIpAddressesRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-ip-addresses-repository'
import { DrizzleSessionsRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-sessions-repository'
import { DrizzleUsersRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-users-repository'

import { ConfirmTokenController } from './confirm-token-controller'
import { applyMiddleware } from '../../middleware/apply-middleware'
import type { HttpController } from '../../protocols/http-controller'

export function makeConfirmTokenController(): HttpController {
  // Repositories
  const drizzleConfirmationTokensRepository =
    new DrizzleConfirmationTokensRepository()
  const drizzleUsersRepository = new DrizzleUsersRepository()
  const drizzleSessionsRepository = new DrizzleSessionsRepository()
  const drizzleIpAddressesRepository = new DrizzleIpAddressesRepository()

  // Adapters
  const jwtAdapter = new JsonWebTokenAdapter()
  const axiosAdapter = new AxiosAdapter()

  // Services
  const locateIpAddress = new LocateIpAddress(axiosAdapter)
  const createSession = new CreateSession(
    jwtAdapter,
    drizzleSessionsRepository,
    drizzleIpAddressesRepository,
    locateIpAddress,
  )
  const verifyUserEmail = new VerifyUserEmail(drizzleUsersRepository)
  const confirmToken = new ConfirmToken(
    drizzleConfirmationTokensRepository,
    createSession,
    verifyUserEmail,
  )

  const confirmTokenController = new ConfirmTokenController(confirmToken)

  return applyMiddleware(confirmTokenController)
}
