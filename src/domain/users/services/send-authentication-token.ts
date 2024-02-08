import { right, type Either } from '@/core/either'
import {
  SendConfirmationToken,
  type SendConfirmationTokenRequest,
} from '@/domain/security/services/send-confirmation-token'

import { ConfirmationTokenType } from '../entities/confirmation-token'

export type SendAuthenticationTokenRequest = Pick<
  SendConfirmationTokenRequest,
  'user'
>

export type SendAuthenticationTokenResponse = Either<never, null>

export const EXPIRATION_TIME_IN_SECONDS = 10 * 60 // 10 minutes

export class SendAuthenticationToken extends SendConfirmationToken {
  async execute({
    user,
  }: SendAuthenticationTokenRequest): Promise<SendAuthenticationTokenResponse> {
    await super.execute({
      user,
      token: {
        type: ConfirmationTokenType.Authentication,
        expiresAt: this.getExpirationDate(),
      },
    })

    return right(null)
  }

  private getExpirationDate(): Date {
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_TIME_IN_SECONDS)

    return expiresAt
  }
}
