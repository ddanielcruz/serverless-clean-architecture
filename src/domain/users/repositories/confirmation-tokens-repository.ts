import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

import type { ConfirmationToken } from '../entities/confirmation-token'

export interface ConfirmationTokensRepository {
  deleteUserUnusedTokens(userId: UniqueEntityId): Promise<void>
  create(token: ConfirmationToken): Promise<void>
}
