import { faker } from '@faker-js/faker'

import type { TokenProps } from '@/domain/security/entities/value-objects/token'
import { Token } from '@/domain/security/entities/value-objects/token'

export function makeToken(override?: Partial<TokenProps>): Token {
  return new Token({
    value: faker.string.alphanumeric(32),
    expiresAt: faker.date.future(),
    ...override,
  })
}
