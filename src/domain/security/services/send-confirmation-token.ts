import { randomBytes } from 'node:crypto'

import { config } from '@/core/config'
import { right, type Either } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Logger } from '@/core/protocols/logger'
import type { EmailSender } from '@/domain/users/email/email-sender'
import { EmailTemplate } from '@/domain/users/email/email-template'
import {
  ConfirmationToken,
  ConfirmationTokenType,
} from '@/domain/users/entities/confirmation-token'
import type { ConfirmationTokensRepository } from '@/domain/users/repositories/confirmation-tokens-repository'

export type ConfirmationTokenEmailTemplate =
  | EmailTemplate.Authentication
  | EmailTemplate.EmailVerification

export type SendConfirmationTokenRequest = {
  user: {
    id: UniqueEntityId
    email: string
  }
  token: {
    type: ConfirmationTokenType
    expiresAt: Date
  }
}

export type SendConfirmationTokenResponse = Either<never, null>

export class SendConfirmationToken {
  constructor(
    private readonly confirmationTokensRepository: ConfirmationTokensRepository,
    private readonly emailSender: EmailSender,
    private readonly logger: Logger,
  ) {}

  async execute({
    user,
    ...request
  }: SendConfirmationTokenRequest): Promise<SendConfirmationTokenResponse> {
    // Delete/invalidate user unused tokens
    await this.confirmationTokensRepository.deleteUserUnusedTokens(user.id)

    // Create a new token
    const token = new ConfirmationToken({
      userId: user.id,
      type: request.token.type,
      expiresAt: request.token.expiresAt,
      token: randomBytes(32).toString('hex'),
    })

    // Log generated token in development
    if (config.isDevelopment) {
      this.logger.debug({
        message: `Confirmation token for user "${user.id}"`,
        token: token.token,
      })
    }

    await this.confirmationTokensRepository.create(token)

    // Send email
    const { subject, template } = this.mapEmailSubjectAndTemplate(token.type)
    await this.emailSender.send({
      to: user.email,
      subject,
      template,
      data: { url: token.url },
    })

    return right(null)
  }

  private mapEmailSubjectAndTemplate(type: ConfirmationTokenType): {
    subject: string
    template: ConfirmationTokenEmailTemplate
  } {
    switch (type) {
      case ConfirmationTokenType.EmailVerification:
        return {
          subject: 'Verify your email',
          template: EmailTemplate.EmailVerification,
        }
      case ConfirmationTokenType.Authentication:
        return {
          subject: 'Authenticate your session',
          template: EmailTemplate.Authentication,
        }
      default:
        throw new Error(`Invalid token type: ${type}`)
    }
  }
}
