import type { IpAddress } from '../entities/ip-address'

export interface IpAddressesRepository {
  create(ipAddress: IpAddress): Promise<void>
  findByAddress(address: string): Promise<IpAddress | null>
}
