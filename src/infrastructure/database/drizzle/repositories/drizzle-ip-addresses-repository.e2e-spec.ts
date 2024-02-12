import { postgresContainer } from '@/test/containers/postgres-container'
import { makeIpAddress } from '@/test/factories/ip-address-factory'

import { DrizzleIpAddressesRepository } from './drizzle-ip-addresses-repository'
import { Database } from '../database'
import { DrizzleIpAddressMapper } from '../mappers/drizzle-ip-address-mapper'
import * as s from '../schema'

describe('DrizzleIpAddressesRepository', () => {
  let db: typeof Database.instance
  let sut: DrizzleIpAddressesRepository

  beforeAll(async () => {
    await postgresContainer.start()
    db = Database.instance
  })

  beforeEach(async () => {
    sut = new DrizzleIpAddressesRepository()
    await db.delete(s.ipAddresses).execute()
  })

  afterAll(async () => {
    await Database.disconnect()
    await postgresContainer.stop()
  })

  describe('create', () => {
    it('creates a new ip address', async () => {
      const ipAddress = makeIpAddress()
      await sut.create(ipAddress)
      const ipAddresses = await db.select().from(s.ipAddresses)
      expect(ipAddresses).toHaveLength(1)
      expect(ipAddresses[0]).toMatchObject(
        DrizzleIpAddressMapper.toDrizzle(ipAddress),
      )
    })
  })

  describe('findByAddress', () => {
    it('returns ip address if found by address', async () => {
      const ipAddress = makeIpAddress()
      await sut.create(ipAddress)
      const foundIpAddress = await sut.findByAddress(ipAddress.address)
      expect(foundIpAddress).toMatchObject(ipAddress)
    })

    it('returns null if ip address is not found by address', async () => {
      const ipAddress = await sut.findByAddress('127.0.0.1')
      expect(ipAddress).toBeNull()
    })
  })
})
