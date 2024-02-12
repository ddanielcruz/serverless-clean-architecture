import { IpAddress } from '@/domain/security/entities/ip-address'

import type * as schema from '../schema'

type DrizzleIpAddress = typeof schema.ipAddresses.$inferSelect

export class DrizzleIpAddressMapper {
  static toDomain(raw: DrizzleIpAddress): IpAddress {
    return new IpAddress(
      {
        address: raw.address,
        latitude: raw.latitude,
        longitude: raw.longitude,
        createdAt: raw.createdAt,
      },
      raw.id,
    )
  }

  static toDrizzle(ipAddress: IpAddress): DrizzleIpAddress {
    return {
      id: ipAddress.id.value,
      address: ipAddress.address,
      latitude: ipAddress.latitude,
      longitude: ipAddress.longitude,
      createdAt: ipAddress.createdAt,
    }
  }
}
