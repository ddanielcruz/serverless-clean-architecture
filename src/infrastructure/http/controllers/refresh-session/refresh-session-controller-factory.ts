import { CreateSession } from '@/domain/security/services/create-session'
import { LocateIpAddress } from '@/domain/security/services/locate-ip-address'
import { RefreshSession } from '@/domain/security/services/refresh-session'
import { AxiosAdapter } from '@/infrastructure/axios/axios-adapter'
import { JsonWebTokenAdapter } from '@/infrastructure/cryptography/jsonwebtoken-adapter'
import { DrizzleIpAddressesRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-ip-addresses-repository'
import { DrizzleSessionsRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-sessions-repository'

import { RefreshSessionController } from './refresh-session-controller'
import { applyMiddleware } from '../../middleware/apply-middleware'

export function makeRefreshSessionController() {
  const jwtAdapter = new JsonWebTokenAdapter()
  const drizzleSessionsRepo = new DrizzleSessionsRepository()
  const drizzleIpAddressesRepo = new DrizzleIpAddressesRepository()
  const httpClient = new AxiosAdapter()
  const locateIpAddress = new LocateIpAddress(httpClient)
  const createSession = new CreateSession(
    jwtAdapter,
    drizzleSessionsRepo,
    drizzleIpAddressesRepo,
    locateIpAddress,
  )
  const refreshSession = new RefreshSession(
    jwtAdapter,
    createSession,
    drizzleSessionsRepo,
  )
  const controller = new RefreshSessionController(refreshSession)

  return applyMiddleware(controller)
}
