import type { Either } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export type CreateSessionRequest = { userId: UniqueEntityId }

export type Session = {
  accessToken: string
  refreshToken: string
}

export type CreateSessionResponse = Either<never, { session: Session }>

export abstract class CreateSession {
  abstract execute(
    request: CreateSessionRequest,
  ): Promise<CreateSessionResponse>
}
