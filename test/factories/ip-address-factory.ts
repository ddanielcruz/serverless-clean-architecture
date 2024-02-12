import { faker } from '@faker-js/faker'

import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { IpAddressProps } from '@/domain/security/entities/ip-address'
import { IpAddress } from '@/domain/security/entities/ip-address'

export function makeIpAddress(
  override?: Partial<IpAddressProps & { id: UniqueEntityId }>,
): IpAddress {
  return new IpAddress(
    {
      address: faker.internet.ip(),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      ...override,
    },
    override?.id,
  )
}
