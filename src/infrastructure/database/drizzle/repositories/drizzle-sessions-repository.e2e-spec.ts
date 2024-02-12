import { postgresContainer } from '@/test/containers/postgres-container'
import { makeIpAddress } from '@/test/factories/ip-address-factory'
import { makeSession } from '@/test/factories/session-factory'
import { makeUser } from '@/test/factories/user-factory'

import { DrizzleSessionsRepository } from './drizzle-sessions-repository'
import { Database } from '../database'
import { DrizzleIpAddressMapper } from '../mappers/drizzle-ip-address-mapper'
import { DrizzleSessionMapper } from '../mappers/drizzle-session-mapper'
import { DrizzleUserMapper } from '../mappers/drizzle-user-mapper'
import * as s from '../schema'

describe('DrizzleSessionsRepository', () => {
  let db: typeof Database.instance
  let sut: DrizzleSessionsRepository
  const user = makeUser()
  const ipAddress = makeIpAddress()

  beforeAll(async () => {
    await postgresContainer.start()
    db = Database.instance
    await db.insert(s.users).values(DrizzleUserMapper.toDrizzle(user))
    await db
      .insert(s.ipAddresses)
      .values(DrizzleIpAddressMapper.toDrizzle(ipAddress))
  })

  beforeEach(async () => {
    sut = new DrizzleSessionsRepository()
    await db.delete(s.sessions).execute()
  })

  afterAll(async () => {
    await Database.disconnect()
    await postgresContainer.stop()
  })

  describe('create', () => {
    it('creates a new session', async () => {
      const session = makeSession({ ipAddress, userId: user.id })
      await sut.create(session)
      const sessions = await db.select().from(s.sessions)
      expect(sessions).toHaveLength(1)
      expect(sessions[0]).toMatchObject(DrizzleSessionMapper.toDrizzle(session))
    })
  })
})
