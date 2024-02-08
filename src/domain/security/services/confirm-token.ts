import { right, left, type Either } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { VerifyUserEmail } from '@/domain/users/services/verify-user-email'

import type { CreateSession, Session } from './create-session'
import { TokenAlreadyUsedError } from './errors/token-already-used-error'
import { TokenExpiredError } from './errors/token-expired-error'
import type { ConfirmationTokensRepository } from '../../users/repositories/confirmation-tokens-repository'

export type ConfirmTokenRequest = {
  token: string
}

export type ConfirmTokenResponse = Either<
  ResourceNotFoundError | TokenAlreadyUsedError | TokenExpiredError,
  { session: Session }
>

export class ConfirmToken {
  constructor(
    private readonly confirmationTokensRepository: ConfirmationTokensRepository,
    private readonly createSession: CreateSession,
    private readonly verifyUserEmail: VerifyUserEmail,
  ) {}

  async execute(request: ConfirmTokenRequest): Promise<ConfirmTokenResponse> {
    // Ensure token exists and it's valid
    const token = await this.confirmationTokensRepository.findByToken(
      request.token,
    )

    if (!token) {
      return left(new ResourceNotFoundError())
    }

    if (token.isUsed) {
      return left(new TokenAlreadyUsedError())
    }

    if (token.isExpired) {
      return left(new TokenExpiredError())
    }

    // Verify user email if it's an email verification token
    if (token.isEmailVerificationToken) {
      const response = await this.verifyUserEmail.execute({
        userId: token.userId,
      })

      if (response.isLeft()) {
        return left(response.value)
      }
    }

    // Create a new session
    const sessionResponse = await this.createSession.execute({
      userId: token.userId,
    })

    // Use token and save it
    token.use()
    await this.confirmationTokensRepository.save(token)

    return right(sessionResponse.value)
  }
}
