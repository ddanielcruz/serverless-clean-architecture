import { faker } from '@faker-js/faker'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { SessionProps } from '@/domain/security/entities/session'
import { Session } from '@/domain/security/entities/session'

import { makeIpAddress } from './ip-address-factory'
import { makeToken } from './token-factory'

export function makeSession(
  override?: Partial<SessionProps & { id: UniqueEntityId }>,
) {
  return new Session(
    {
      userId: new UniqueEntityId(),
      ipAddress: makeIpAddress(),
      accessToken: makeToken(),
      refreshToken: makeToken(),
      userAgent: faker.internet.userAgent(),
      ...override,
    },
    override?.id,
  )
}
