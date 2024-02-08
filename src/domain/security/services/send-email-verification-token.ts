import { right, type Either } from '@/core/either'
import type { SendConfirmationTokenRequest } from '@/domain/security/services/send-confirmation-token'
import { SendConfirmationToken } from '@/domain/security/services/send-confirmation-token'

import { ConfirmationTokenType } from '../../users/entities/confirmation-token'

export type SendEmailVerificationTokenRequest = Pick<
  SendConfirmationTokenRequest,
  'user'
>

export type SendEmailVerificationTokenResponse = Either<never, null>

export const EXPIRATION_TIME_IN_SECONDS = 60 * 60 // 1 hour

export class SendEmailVerificationToken extends SendConfirmationToken {
  async execute({
    user,
  }: SendEmailVerificationTokenRequest): Promise<SendEmailVerificationTokenResponse> {
    await super.execute({
      user,
      token: {
        type: ConfirmationTokenType.EmailVerification,
        expirationTime: EXPIRATION_TIME_IN_SECONDS,
      },
    })

    return right(null)
  }
}
