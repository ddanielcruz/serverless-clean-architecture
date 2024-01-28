import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { User } from '@/domain/users/entities/user'
import type { UsersRepository } from '@/domain/users/repositories/users-repository'

export class InMemoryUsersRepository implements UsersRepository {
  items: User[] = []

  async create(user: User): Promise<void> {
    this.items.push(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((user) => user.email === email) ?? null
  }

  async findById(id: UniqueEntityId): Promise<User | null> {
    return this.items.find((user) => user.id.equals(id)) ?? null
  }

  async save(user: User): Promise<void> {
    this.items = this.items.map((item) =>
      item.id.equals(user.id) ? user : item,
    )
  }
}
