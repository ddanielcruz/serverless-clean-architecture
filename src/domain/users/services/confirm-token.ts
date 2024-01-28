import { right, left, type Either } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import type { CreateSession, Session } from './create-session'
import { TokenAlreadyUsedError } from './errors/token-already-used-error'
import { TokenExpiredError } from './errors/token-expired-error'
import type { ConfirmationTokensRepository } from '../repositories/confirmation-tokens-repository'
import type { UsersRepository } from '../repositories/users-repository'

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
    private readonly usersRepository: UsersRepository,
    private readonly createSession: CreateSession,
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
      const user = await this.usersRepository.findById(token.userId)
      if (!user) {
        return left(new ResourceNotFoundError())
      }

      user.verifyEmail()
      await this.usersRepository.save(user)
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
