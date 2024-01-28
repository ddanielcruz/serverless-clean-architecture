import { faker } from '@faker-js/faker'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { ConfirmationTokenProps } from '@/domain/users/entities/confirmation-token'
import {
  ConfirmationToken,
  ConfirmationTokenType,
} from '@/domain/users/entities/confirmation-token'

export function makeConfirmationToken(
  override?: Partial<ConfirmationTokenProps> & { id?: UniqueEntityId },
) {
  return new ConfirmationToken(
    {
      userId: new UniqueEntityId(),
      type: ConfirmationTokenType.EmailVerification,
      expiresAt: faker.date.future(),
      token: faker.string.alphanumeric(64),
      ...override,
    },
    override?.id,
  )
}
