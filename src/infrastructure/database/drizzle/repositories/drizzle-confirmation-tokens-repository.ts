import { and, eq, isNull } from 'drizzle-orm'

import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { ConfirmationToken } from '@/domain/users/entities/confirmation-token'
import type { ConfirmationTokensRepository } from '@/domain/users/repositories/confirmation-tokens-repository'

import { Database } from '../database'
import { DrizzleConfirmationTokenMapper } from '../mappers/drizzle-confirmation-token-mapper'
import * as s from '../schema'

export class DrizzleConfirmationTokensRepository
  implements ConfirmationTokensRepository
{
  private readonly db = Database.instance

  async deleteUserUnusedTokens(userId: UniqueEntityId): Promise<void> {
    await this.db
      .delete(s.confirmationTokens)
      .where(
        and(
          eq(s.confirmationTokens.userId, userId.toString()),
          isNull(s.confirmationTokens.usedAt),
        ),
      )
  }

  async create(token: ConfirmationToken): Promise<void> {
    await this.db
      .insert(s.confirmationTokens)
      .values(DrizzleConfirmationTokenMapper.toDrizzle(token))
  }

  async findByToken(tokenValue: string): Promise<ConfirmationToken | null> {
    const output = await this.db
      .select()
      .from(s.confirmationTokens)
      .where(eq(s.confirmationTokens.token, tokenValue))

    return output.length > 0
      ? DrizzleConfirmationTokenMapper.toDomain(output[0])
      : null
  }

  async save(token: ConfirmationToken): Promise<void> {
    const { id, ...values } = DrizzleConfirmationTokenMapper.toDrizzle(token)

    await this.db
      .update(s.confirmationTokens)
      .set(values)
      .where(eq(s.confirmationTokens.id, id.toString()))
  }
}
