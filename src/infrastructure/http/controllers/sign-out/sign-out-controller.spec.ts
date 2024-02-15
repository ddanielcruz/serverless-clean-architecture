import { right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { InvalidateSession } from '@/domain/security/services/invalidate-session'

import { SignOutController } from './sign-out-controller'
import type { HttpRequest } from '../../protocols/http-controller'

describe('SignOutController', () => {
  let sut: SignOutController
  let invalidateSession: InvalidateSession

  const httpRequest: HttpRequest = {
    body: null,
    headers: {},
    query: {},
    ipAddress: 'any-ip-address',
    session: {
      sessionId: new UniqueEntityId(),
      userId: new UniqueEntityId(),
    },
  }

  beforeEach(() => {
    invalidateSession = {
      execute: vi.fn().mockResolvedValue(right(null)),
    } as unknown as InvalidateSession
    sut = new SignOutController(invalidateSession)
  })

  it('returns 401 if request is not authorized', async () => {
    const response = await sut.handle({ ...httpRequest, session: null })
    expect(response.statusCode).toBe(401)
  })

  it('invalidates session with correct parameters', async () => {
    await sut.handle(httpRequest)
    expect(invalidateSession.execute).toHaveBeenCalledWith({
      sessionId: httpRequest.session?.sessionId,
    })
  })

  it('returns 204 on success', async () => {
    const response = await sut.handle(httpRequest)
    expect(response.statusCode).toBe(204)
  })

  it('returns a "Set-Cookie" header to invalidate session in the client', async () => {
    const response = await sut.handle(httpRequest)
    expect(response.headers).toHaveProperty('Set-Cookie')
    expect(response.headers?.['Set-Cookie']).toHaveLength(2)
  })
})
