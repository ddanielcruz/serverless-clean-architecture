import { ZodError } from 'zod'

import { left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Session } from '@/domain/security/entities/session'
import type { ConfirmToken } from '@/domain/security/services/confirm-token'
import { TokenAlreadyUsedError } from '@/domain/security/services/errors/token-already-used-error'
import { TokenExpiredError } from '@/domain/security/services/errors/token-expired-error'
import { UnidentifiedSessionError } from '@/domain/security/services/errors/unidentified-session-error'
import { makeSession } from '@/test/factories/session-factory'

import { ConfirmTokenController } from './confirm-token-controller'
import { sessionCookieOptions } from '../../config/cookie'
import { HttpCode, type HttpRequest } from '../../protocols/http-controller'
import { serializeCookie } from '../../utils/cookie'

const session: Session = makeSession()

describe('ConfirmTokenController', () => {
  let sut: ConfirmTokenController
  let confirmToken: ConfirmToken
  const httpRequest = {
    body: null,
    query: { token: 'any-token' },
    headers: { 'user-agent': 'any-agent' },
    ipAddress: '127.0.0.1',
  } satisfies HttpRequest

  beforeEach(() => {
    confirmToken = {
      execute: vi.fn().mockResolvedValue(right({ session })),
    } as unknown as ConfirmToken
    sut = new ConfirmTokenController(confirmToken)
  })

  it('throws a ZodError on invalid request', async () => {
    const promise = sut.handle({ ...httpRequest, query: {} })
    await expect(promise).rejects.toThrow(ZodError)
  })

  it('returns 404 on resource not found', async () => {
    const error = new ResourceNotFoundError()
    vi.spyOn(confirmToken, 'execute').mockResolvedValueOnce(left(error))
    const response = await sut.handle(httpRequest)
    expect(response).toEqual({
      statusCode: HttpCode.NOT_FOUND,
      body: { message: error.message },
    })
  })

  it('returns 409 on token already used', async () => {
    const error = new TokenAlreadyUsedError()
    vi.spyOn(confirmToken, 'execute').mockResolvedValueOnce(left(error))
    const response = await sut.handle(httpRequest)
    expect(response).toEqual({
      statusCode: HttpCode.CONFLICT,
      body: { message: error.message },
    })
  })

  it('returns 400 on token expired', async () => {
    const error = new TokenExpiredError()
    vi.spyOn(confirmToken, 'execute').mockResolvedValueOnce(left(error))
    const response = await sut.handle(httpRequest)
    expect(response).toEqual({
      statusCode: HttpCode.BAD_REQUEST,
      body: { message: error.message },
    })
  })

  it('returns 400 on unidentified session error', async () => {
    const error = new UnidentifiedSessionError()
    vi.spyOn(confirmToken, 'execute').mockResolvedValueOnce(left(error))
    const response = await sut.handle(httpRequest)
    expect(response).toEqual({
      statusCode: HttpCode.BAD_REQUEST,
      body: { message: error.message },
    })
  })

  it('returns 200 on success', async () => {
    const response = await sut.handle(httpRequest)
    expect(response).toEqual({
      statusCode: HttpCode.NO_CONTENT,
      headers: {
        'Set-Cookie': expect.any(String),
      },
    })
  })

  it('returns the session tokens as a session cookie', async () => {
    const response = await sut.handle(httpRequest)
    const cookies = response.headers?.['Set-Cookie']
    expect(cookies).toEqual(
      [
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
      ].join(', '),
    )
  })

  it('invokes use case with correct parameters', async () => {
    const executeSpy = vi.spyOn(confirmToken, 'execute')
    await sut.handle(httpRequest)
    expect(executeSpy).toHaveBeenCalledWith({
      token: httpRequest.query.token,
      ipAddress: httpRequest.ipAddress,
      userAgent: httpRequest.headers['user-agent'],
    })
  })

  it('sets user agent to unknown if not defined', async () => {
    const executeSpy = vi.spyOn(confirmToken, 'execute')
    await sut.handle({ ...httpRequest, headers: {} })
    expect(executeSpy).toHaveBeenCalledWith({
      token: httpRequest.query.token,
      ipAddress: httpRequest.ipAddress,
      userAgent: 'unknown',
    })
  })
})
