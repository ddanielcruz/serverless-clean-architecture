import { right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { makeUser } from '@/test/factories/user-factory'
import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository'

import type { SendAuthenticationToken } from './send-authentication-token'
import { SignIn } from './sign-in'

describe('SignIn', () => {
  let sut: SignIn
  let sendAuthToken: SendAuthenticationToken
  let inMemoryUsersRepository: InMemoryUsersRepository
  const user = makeUser({ emailVerifiedAt: new Date() })

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryUsersRepository.items.push(user)

    sendAuthToken = {
      execute: vi.fn().mockResolvedValue(right(null)),
    } as unknown as SendAuthenticationToken
    sut = new SignIn(inMemoryUsersRepository, sendAuthToken)
  })

  it('finds user by email using UsersRepository', async () => {
    const findByEmailSpy = vi.spyOn(inMemoryUsersRepository, 'findByEmail')
    await sut.execute({ email: user.email })
    expect(findByEmailSpy).toHaveBeenCalledWith(user.email)
  })

  it('returns a ResourceNotFoundError if user is not found', async () => {
    const response = await sut.execute({ email: 'any-email' })
    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('returns a ResourceNotFoundError if user email is not verified', async () => {
    const unverifiedUser = makeUser()
    inMemoryUsersRepository.items.push(unverifiedUser)
    const response = await sut.execute({ email: unverifiedUser.email })
    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('sends an authentication token on success', async () => {
    const executeSpy = vi.spyOn(sendAuthToken, 'execute')
    const response = await sut.execute({ email: user.email })
    expect(response.isRight()).toBeTruthy()
    expect(executeSpy).toHaveBeenCalledWith({ user })
  })
})
