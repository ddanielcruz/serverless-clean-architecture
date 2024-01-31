import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ConfirmationToken } from '@/domain/users/entities/confirmation-token'

import type * as schema from '../schema'

type DrizzleConfirmationToken = typeof schema.confirmationTokens.$inferSelect

export class DrizzleConfirmationTokenMapper {
  static toDomain(raw: DrizzleConfirmationToken): ConfirmationToken {
    return new ConfirmationToken(
      {
        token: raw.token,
        type: raw.type,
        usedAt: raw.usedAt,
        userId: new UniqueEntityId(raw.userId),
        expiresAt: raw.expiresAt,
        createdAt: raw.createdAt,
      },
      raw.id,
    )
  }

  static toDrizzle(token: ConfirmationToken): DrizzleConfirmationToken {
    return {
      id: token.id.toString(),
      token: token.token,
      type: token.type,
      usedAt: token.usedAt,
      userId: token.userId.toString(),
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
    }
  }
}
