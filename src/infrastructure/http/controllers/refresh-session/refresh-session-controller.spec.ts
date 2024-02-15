import { left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { RefreshTokenInvalidError } from '@/domain/security/services/errors/refresh-token-invalid-error'
import { UnidentifiedSessionError } from '@/domain/security/services/errors/unidentified-session-error'
import type { RefreshSession } from '@/domain/security/services/refresh-session'
import { makeSession } from '@/test/factories/session-factory'

import { RefreshSessionController } from './refresh-session-controller'
import { sessionCookieOptions } from '../../config/cookie'
import type { HttpRequest } from '../../protocols/http-controller'
import { serializeCookie } from '../../utils/cookie'

describe('RefreshSessionController', () => {
  let sut: RefreshSessionController
  let refreshSession: RefreshSession
  const session = makeSession()

  const request: HttpRequest = {
    body: null,
    headers: {
      cookie: 'refreshToken=valid-token',
      'user-agent': 'valid-user-agent',
    },
    ipAddress: 'valid-ip-address',
    query: {},
    session: null,
  }

  beforeEach(() => {
    refreshSession = {
      execute: vi.fn().mockResolvedValue(right({ session })),
    } as unknown as RefreshSession
    sut = new RefreshSessionController(refreshSession)
  })

  it.each(['', 'anyCookie=anyValue'])(
    'returns 401 if refresh token is not provided: %j',
    async (cookie) => {
      const response = await sut.handle({ ...request, headers: { cookie } })
      expect(response.statusCode).toBe(401)
    },
  )

  it('refreshes session with correct parameters', async () => {
    const executeSpy = vi.spyOn(refreshSession, 'execute')
    await sut.handle(request)
    expect(executeSpy).toHaveBeenCalledWith({
      refreshToken: 'valid-token',
      ipAddress: 'valid-ip-address',
      userAgent: 'valid-user-agent',
    })
  })

  it('returns 400 on UnidentifiedSessionError', async () => {
    const error = new UnidentifiedSessionError()
    vi.spyOn(refreshSession, 'execute').mockResolvedValue(left(error))
    const response = await sut.handle(request)
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({ message: error.message })
  })

  it('returns 401 on RefreshTokenInvalidError', async () => {
    vi.spyOn(refreshSession, 'execute').mockResolvedValue(
      left(new RefreshTokenInvalidError()),
    )
    const response = await sut.handle(request)
    expect(response.statusCode).toBe(401)
  })

  it('returns 401 on ResourceNotFoundError', async () => {
    vi.spyOn(refreshSession, 'execute').mockResolvedValue(
      left(new ResourceNotFoundError()),
    )
    const response = await sut.handle(request)
    expect(response.statusCode).toBe(401)
  })

  it('returns 204 on success with session cookies', async () => {
    const response = await sut.handle(request)
    expect(response.statusCode).toBe(204)
    expect(response.headers).toEqual({
      'Set-Cookie': [
        serializeCookie(
          'accessToken',
          session.accessToken.value,
          sessionCookieOptions,
        ),
        serializeCookie(
          'refreshToken',
          session.refreshToken.value,
          sessionCookieOptions,
        ),
      ],
    })
  })
})
