import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

import type { User } from '../entities/user'

export interface UsersRepository {
  create(user: User): Promise<void>
  findByEmail(email: string): Promise<User | null>
  findById(id: UniqueEntityId): Promise<User | null>
  save(user: User): Promise<void>
}
