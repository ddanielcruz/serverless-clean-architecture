import { left, type Either, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import type { CreateSession } from './create-session'
import { RefreshTokenInvalidError } from './errors/refresh-token-invalid-error'
import { UnidentifiedSessionError } from './errors/unidentified-session-error'
import type { VerifyToken } from '../cryptography/verify-token'
import type { Session } from '../entities/session'
import { TokenSecret } from '../protocols/token'
import type { SessionsRepository } from '../repositories/sessions-repository'

export interface RefreshSessionRequest {
  refreshToken: string
  ipAddress: string
  userAgent: string
}

export type RefreshSessionResponse = Either<
  RefreshTokenInvalidError | ResourceNotFoundError | UnidentifiedSessionError,
  { session: Session }
>

export class RefreshSession {
  constructor(
    private readonly verifyToken: VerifyToken,
    private readonly createSession: CreateSession,
    private readonly sessionsRepository: SessionsRepository,
  ) {}

  async execute({
    refreshToken,
    ipAddress,
    userAgent,
  }: RefreshSessionRequest): Promise<RefreshSessionResponse> {
    // Verify token is valid and not expired
    const payload = await this.verifyToken.verify({
      token: refreshToken,
      secret: TokenSecret.RefreshToken,
    })

    if (!payload) {
      return left(new RefreshTokenInvalidError())
    }

    // Invalidate session
    const sessionId = new UniqueEntityId(payload.session)
    const invalidated = await this.sessionsRepository.invalidate(sessionId)

    if (!invalidated) {
      return left(new ResourceNotFoundError())
    }

    // Create a new session
    // TODO Throw an error if new IP address is too far from the original one
    const createSessionResponse = await this.createSession.execute({
      userId: new UniqueEntityId(payload.sub),
      ipAddress,
      userAgent,
    })

    if (createSessionResponse.isLeft()) {
      return left(new UnidentifiedSessionError())
    }

    return right(createSessionResponse.value)
  }
}
