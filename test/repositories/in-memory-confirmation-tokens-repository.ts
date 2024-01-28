import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { ConfirmationToken } from '@/domain/users/entities/confirmation-token'
import type { ConfirmationTokensRepository } from '@/domain/users/repositories/confirmation-tokens-repository'

export class InMemoryConfirmationTokensRepository
  implements ConfirmationTokensRepository
{
  items: ConfirmationToken[] = []

  async deleteUserUnusedTokens(userId: UniqueEntityId): Promise<void> {
    this.items = this.items.filter(
      (item) => item.userId !== userId || item.isUsed,
    )
  }

  async create(token: ConfirmationToken): Promise<void> {
    this.items.push(token)
  }
}
