import { faker } from '@faker-js/faker'

import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { UserProps } from '@/domain/users/entities/user'
import { User } from '@/domain/users/entities/user'

export function makeUser(
  override?: Partial<UserProps & { id: UniqueEntityId }>,
): User {
  return new User(
    {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      ...override,
    },
    override?.id,
  )
}
