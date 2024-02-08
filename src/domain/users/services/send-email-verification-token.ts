import { randomBytes } from 'node:crypto'

import { config } from '@/core/config'
import { right, type Either } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Logger } from '@/core/protocols/logger'

import type { EmailSender } from '../email/email-sender'
import { EmailTemplate } from '../email/email-template'
import {
  ConfirmationToken,
  ConfirmationTokenType,
} from '../entities/confirmation-token'
import type { ConfirmationTokensRepository } from '../repositories/confirmation-tokens-repository'

export type SendEmailVerificationTokenRequest = {
  user: {
    id: UniqueEntityId
    email: string
  }
}

export type SendEmailVerificationTokenResponse = Either<never, null>

export const EXPIRATION_TIME_IN_SECONDS = 60 * 60 // 1 hour

export class SendEmailVerificationToken {
  constructor(
    private readonly confirmationTokensRepository: ConfirmationTokensRepository,
    private readonly emailSender: EmailSender,
    private readonly logger: Logger,
  ) {}

  async execute({
    user,
  }: SendEmailVerificationTokenRequest): Promise<SendEmailVerificationTokenResponse> {
    // Delete/invalidate user unused tokens
    await this.confirmationTokensRepository.deleteUserUnusedTokens(user.id)

    // Create a new token
    const token = new ConfirmationToken({
      userId: user.id,
      type: ConfirmationTokenType.EmailVerification,
      token: randomBytes(32).toString('hex'),
      expiresAt: this.getExpirationDate(),
    })

    // Log generated token in development
    if (config.isDevelopment) {
      this.logger.debug({
        message: `Email verification token for user ${user.id}`,
        token: token.token,
      })
    }

    await this.confirmationTokensRepository.create(token)

    // Send email
    await this.emailSender.send({
      to: user.email,
      subject: 'Verify your email',
      template: EmailTemplate.EmailVerification,
      data: { url: token.url },
    })

    return right(null)
  }

  private getExpirationDate(): Date {
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_TIME_IN_SECONDS)

    return expiresAt
  }
}
