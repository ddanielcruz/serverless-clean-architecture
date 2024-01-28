import type { Either } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export type SendEmailVerificationTokenRequest = {
  userId: UniqueEntityId
}

export type SendEmailVerificationTokenResponse = Either<never, null>

export abstract class SendEmailVerificationToken {
  abstract execute(
    request: SendEmailVerificationTokenRequest,
  ): Promise<SendEmailVerificationTokenResponse>
}
