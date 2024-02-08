import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { makeUser } from '@/test/factories/user-factory'
import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository'

import { VerifyUserEmail } from './verify-user-email'

describe('VerifyUserEmail', () => {
  let sut: VerifyUserEmail
  let usersRepository: InMemoryUsersRepository

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new VerifyUserEmail(usersRepository)
  })

  it('returns a ResourceNotFoundError if user is not found', async () => {
    const response = await sut.execute({ userId: new UniqueEntityId() })
    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('verifies user email', async () => {
    const user = makeUser()
    usersRepository.items.push(user)
    const response = await sut.execute({ userId: user.id })
    expect(response.isRight()).toBe(true)
    expect(user.isEmailVerified).toBe(true)
    expect(user.emailVerifiedAt).toBeTruthy()
    expect(user).toEqual(usersRepository.items[0])
  })

  it('does not override verified date if email was already verified', async () => {
    const emailVerifiedAt = new Date()
    const user = makeUser({ emailVerifiedAt })
    usersRepository.items.push(user)
    const response = await sut.execute({ userId: user.id })
    expect(response.isRight()).toBe(true)
    expect(user.emailVerifiedAt).toEqual(emailVerifiedAt)
  })
})
