import { eq } from 'drizzle-orm'

import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { User } from '@/domain/users/entities/user'
import type { UsersRepository } from '@/domain/users/repositories/users-repository'

import { Database } from '../database'
import { DrizzleUserMapper } from '../mappers/drizzle-user-mapper'
import * as s from '../schema'

export class DrizzleUsersRepository implements UsersRepository {
  private readonly db = Database.instance

  async create(user: User): Promise<void> {
    await this.db.insert(s.users).values(DrizzleUserMapper.toDrizzle(user))
  }

  async findByEmail(email: string): Promise<User | null> {
    const output = await this.db
      .select()
      .from(s.users)
      .where(eq(s.users.email, email))

    return output.length > 0 ? DrizzleUserMapper.toDomain(output[0]) : null
  }

  async findById(id: UniqueEntityId): Promise<User | null> {
    const output = await this.db
      .select()
      .from(s.users)
      .where(eq(s.users.id, id.value))

    return output.length > 0 ? DrizzleUserMapper.toDomain(output[0]) : null
  }

  async save(user: User): Promise<void> {
    const { id, ...values } = DrizzleUserMapper.toDrizzle(user)
    await this.db.update(s.users).set(values).where(eq(s.users.id, id))
  }
}
