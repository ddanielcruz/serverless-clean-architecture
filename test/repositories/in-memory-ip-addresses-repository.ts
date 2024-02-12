import type { IpAddress } from '@/domain/security/entities/ip-address'
import type { IpAddressesRepository } from '@/domain/security/repositories/ip-addresses-repository'

export class InMemoryIpAddressesRepository implements IpAddressesRepository {
  readonly items: IpAddress[] = []

  async create(ipAddress: IpAddress): Promise<void> {
    this.items.push(ipAddress)
  }

  async findByAddress(address: string): Promise<IpAddress | null> {
    return this.items.find((item) => item.address === address) || null
  }
}
