import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { makeSession } from '@/test/factories/session-factory'
import { InMemorySessionsRepository } from '@/test/repositories/in-memory-sessions-repository'

import { InvalidateSession } from './invalidate-session'

describe('InvalidateSession', () => {
  let sut: InvalidateSession
  let sessionsRepository: InMemorySessionsRepository
  const session = makeSession()

  beforeEach(() => {
    sessionsRepository = new InMemorySessionsRepository()
    sut = new InvalidateSession(sessionsRepository)
    sessionsRepository.items.push(session)
  })

  it('invalidates session by session ID', async () => {
    const invalidateSpy = vi.spyOn(sessionsRepository, 'invalidate')
    await sut.execute({ sessionId: session.id })
    expect(invalidateSpy).toHaveBeenCalledWith(session.id)
  })

  it('returns a ResourceNotFoundError if fails to invalidate session', async () => {
    const response = await sut.execute({ sessionId: new UniqueEntityId() })
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('returns null on success', async () => {
    const response = await sut.execute({ sessionId: session.id })
    expect(response.isRight()).toBe(true)
    expect(response.value).toBeNull()
  })
})
