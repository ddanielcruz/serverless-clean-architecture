import { postgresContainer } from '@/test/containers/postgres-container'
import { makeConfirmationToken } from '@/test/factories/confirmation-token-factory'
import { makeUser } from '@/test/factories/user-factory'

import { DrizzleConfirmationTokensRepository } from './drizzle-confirmation-tokens-repository'
import { Database } from '../database'
import { DrizzleConfirmationTokenMapper } from '../mappers/drizzle-confirmation-token-mapper'
import { DrizzleUserMapper } from '../mappers/drizzle-user-mapper'
import * as s from '../schema'

describe('DrizzleConfirmationTokensRepository', () => {
  let db: typeof Database.instance
  let sut: DrizzleConfirmationTokensRepository
  const user = makeUser()

  beforeAll(async () => {
    await postgresContainer.start()
    db = Database.instance
    await db.insert(s.users).values(DrizzleUserMapper.toDrizzle(user)).execute()
  })

  beforeEach(async () => {
    sut = new DrizzleConfirmationTokensRepository()
    await db.delete(s.confirmationTokens).execute()
  })

  afterAll(async () => {
    await Database.disconnect()
    await postgresContainer.stop()
  })

  describe('deleteUserUnusedTokens', () => {
    it('deletes all unused tokens from user', async () => {
      const tokens = [
        makeConfirmationToken({ userId: user.id }),
        makeConfirmationToken({ userId: user.id }),
        makeConfirmationToken({ userId: user.id, usedAt: new Date() }),
      ].map(DrizzleConfirmationTokenMapper.toDrizzle)
      await db.insert(s.confirmationTokens).values(tokens).execute()

      await sut.deleteUserUnusedTokens(user.id)

      const dbTokens = await db.select().from(s.confirmationTokens)
      expect(dbTokens).toHaveLength(1)
      expect(dbTokens[0]).toMatchObject(tokens[2])
    })

    it('does not delete tokens from other users', async () => {
      const anotherUser = makeUser()
      await db
        .insert(s.users)
        .values(DrizzleUserMapper.toDrizzle(anotherUser))
        .execute()

      const tokens = [
        makeConfirmationToken({ userId: user.id }),
        makeConfirmationToken({ userId: user.id, usedAt: new Date() }),
        makeConfirmationToken({ userId: anotherUser.id }),
      ].map(DrizzleConfirmationTokenMapper.toDrizzle)
      await db.insert(s.confirmationTokens).values(tokens).execute()

      await sut.deleteUserUnusedTokens(user.id)

      const dbTokens = await db.select().from(s.confirmationTokens)
      expect(dbTokens).toHaveLength(2)
      expect(dbTokens[0]).toMatchObject(tokens[1])
      expect(dbTokens[1]).toMatchObject(tokens[2])
    })
  })

  describe('create', () => {
    it('creates a new confirmation token', async () => {
      const token = makeConfirmationToken({ userId: user.id })
      await sut.create(token)

      const tokens = await db.select().from(s.confirmationTokens)
      expect(tokens).toHaveLength(1)
      expect(tokens[0]).toMatchObject(
        DrizzleConfirmationTokenMapper.toDrizzle(token),
      )
    })
  })

  describe('findByToken', () => {
    it('returns null if token is not found by token value', async () => {
      const token = await sut.findByToken('any-token')
      expect(token).toBeNull()
    })

    it('returns token if token is found by token value', async () => {
      const createdToken = makeConfirmationToken({ userId: user.id })
      await db
        .insert(s.confirmationTokens)
        .values(DrizzleConfirmationTokenMapper.toDrizzle(createdToken))
        .execute()

      const token = await sut.findByToken(createdToken.token)
      expect(token).toMatchObject(createdToken)
    })
  })

  describe('save', () => {
    it('updates the token', async () => {
      const createdToken = makeConfirmationToken({ userId: user.id })
      await db
        .insert(s.confirmationTokens)
        .values(DrizzleConfirmationTokenMapper.toDrizzle(createdToken))
        .execute()

      const updatedToken = makeConfirmationToken({
        id: createdToken.id,
        userId: user.id,
        usedAt: new Date(),
      })
      await sut.save(updatedToken)

      const tokens = await db.select().from(s.confirmationTokens)
      expect(tokens).toHaveLength(1)
      expect(tokens[0]).toMatchObject(
        DrizzleConfirmationTokenMapper.toDrizzle(updatedToken),
      )
    })
  })
})
