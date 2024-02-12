import { eq } from 'drizzle-orm'

import type { IpAddress } from '@/domain/security/entities/ip-address'
import type { IpAddressesRepository } from '@/domain/security/repositories/ip-addresses-repository'

import { Database } from '../database'
import { DrizzleIpAddressMapper } from '../mappers/drizzle-ip-address-mapper'
import * as s from '../schema'

export class DrizzleIpAddressesRepository implements IpAddressesRepository {
  private readonly db = Database.instance

  async create(ipAddress: IpAddress): Promise<void> {
    await this.db
      .insert(s.ipAddresses)
      .values(DrizzleIpAddressMapper.toDrizzle(ipAddress))
  }

  async findByAddress(address: string): Promise<IpAddress | null> {
    const output = await this.db
      .select()
      .from(s.ipAddresses)
      .where(eq(s.ipAddresses.address, address))

    return output.length > 0 ? DrizzleIpAddressMapper.toDomain(output[0]) : null
  }
}
