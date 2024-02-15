import { right, type Either, left } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import type { SessionsRepository } from '../repositories/sessions-repository'

export type InvalidateSessionRequest = { sessionId: UniqueEntityId }

export type InvalidateSessionResponse = Either<ResourceNotFoundError, null>

export class InvalidateSession {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute({
    sessionId,
  }: InvalidateSessionRequest): Promise<InvalidateSessionResponse> {
    const invalidated = await this.sessionsRepository.invalidate(sessionId)

    if (!invalidated) {
      return left(new ResourceNotFoundError())
    }

    return right(null)
  }
}
