import type { User } from '@/domain/users/entities/user'
import type { UsersRepository } from '@/domain/users/repositories/users-repository'

export class InMemoryUsersRepository implements UsersRepository {
  readonly items: User[] = []

  async create(user: User): Promise<void> {
    this.items.push(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((user) => user.email === email) ?? null
  }
}
