import { postgresContainer } from '@/test/containers/postgres-container'
import { makeUser } from '@/test/factories/user-factory'

import { DrizzleUsersRepository } from './drizzle-users-repository'
import { Database } from '../database'
import { DrizzleUserMapper } from '../mappers/drizzle-user-mapper'
import * as s from '../schema'

describe('DrizzleUsersRepository', () => {
  let db: typeof Database.instance
  let sut: DrizzleUsersRepository

  beforeAll(async () => {
    await postgresContainer.start()
    db = Database.instance
  })

  beforeEach(async () => {
    sut = new DrizzleUsersRepository()
    await db.delete(s.users).execute()
  })

  afterAll(async () => {
    await Database.disconnect()
    await postgresContainer.stop()
  })

  describe('create', () => {
    it('creates a new user', async () => {
      const domainUser = makeUser()
      await sut.create(domainUser)
      const users = await db.select().from(s.users)

      expect(users).toHaveLength(1)
      expect(users[0]).toMatchObject(DrizzleUserMapper.toDrizzle(domainUser))
    })
  })

  describe('findByEmail', () => {
    it('returns null if user is not found', async () => {
      const user = await sut.findByEmail('any-email')
      expect(user).toBeNull()
    })

    it('returns the user if it is found', async () => {
      const domainUser = makeUser()
      await db.insert(s.users).values(DrizzleUserMapper.toDrizzle(domainUser))
      const user = await sut.findByEmail(domainUser.email)

      expect(user).toMatchObject(domainUser)
    })
  })

  describe('findById', () => {
    it('returns null if user is not found', async () => {
      const user = await sut.findById(makeUser().id)
      expect(user).toBeNull()
    })

    it('returns the user if it is found', async () => {
      const domainUser = makeUser()
      await db.insert(s.users).values(DrizzleUserMapper.toDrizzle(domainUser))
      const user = await sut.findById(domainUser.id)

      expect(user).toMatchObject(domainUser)
    })
  })

  describe('save', () => {
    it('updates the user', async () => {
      const domainUser = makeUser()
      await db.insert(s.users).values(DrizzleUserMapper.toDrizzle(domainUser))
      const updatedUser = makeUser({ id: domainUser.id, name: 'updated-name' })
      await sut.save(updatedUser)
      const users = await db.select().from(s.users)

      expect(users).toHaveLength(1)
      expect(users[0]).toMatchObject(DrizzleUserMapper.toDrizzle(updatedUser))
      expect(users[0].name).toEqual('updated-name')
    })
  })
})
