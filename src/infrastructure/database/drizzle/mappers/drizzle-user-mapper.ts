import { User } from '@/domain/users/entities/user'

import type * as schema from '../schema'

type DrizzleUser = typeof schema.users.$inferSelect

export class DrizzleUserMapper {
  static toDomain(raw: DrizzleUser): User {
    return new User(
      {
        email: raw.email,
        name: raw.name,
        emailVerifiedAt: raw.emailVerifiedAt,
        createdAt: raw.createdAt,
      },
      raw.id,
    )
  }

  static toDrizzle(user: User): DrizzleUser {
    return {
      id: user.id.value,
      name: user.name,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
    }
  }
}
