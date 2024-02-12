import { right, type Either } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

import type { SignToken } from '../cryptography/sign-token'
import { TokenSecret } from '../protocols/token'

export type CreateSessionRequest = { userId: UniqueEntityId }

export type Session = {
  accessToken: string
  refreshToken: string
}

export type CreateSessionResponse = Either<never, { session: Session }>

export class CreateSession {
  constructor(private readonly signToken: SignToken) {}

  async execute(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    const payload = { sub: request.userId.toString() }
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken.sign({ payload, secret: TokenSecret.AccessToken }),
      this.signToken.sign({ payload, secret: TokenSecret.RefreshToken }),
    ])

    return right({
      session: {
        accessToken: accessToken.value,
        refreshToken: refreshToken.value,
      },
    })
  }
}
