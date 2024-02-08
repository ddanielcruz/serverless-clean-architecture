import type { Either } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export type SendAuthenticationTokenRequest = {
  user: {
    id: UniqueEntityId
    email: string
  }
}

export type SendAuthenticationTokenResponse = Either<never, null>

export abstract class SendAuthenticationToken {
  abstract execute(
    request: SendAuthenticationTokenRequest,
  ): Promise<SendAuthenticationTokenResponse>
}
