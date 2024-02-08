import { right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { SendEmailVerificationToken } from '@/domain/security/services/send-email-verification-token'
import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository'

import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import type { SignUpRequest } from './sign-up'
import { SignUp } from './sign-up'
import { User } from '../entities/user'

describe('SignUp', () => {
  let sut: SignUp
  let inMemoryUsersRepository: InMemoryUsersRepository
  let sendEmailVerificationToken: SendEmailVerificationToken

  const request: SignUpRequest = {
    name: 'Daniel',
    email: 'daniel@example.com',
  }

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    sendEmailVerificationToken = {
      execute: vi.fn().mockResolvedValue(right(null)),
    } as unknown as SendEmailVerificationToken
    sut = new SignUp(inMemoryUsersRepository, sendEmailVerificationToken)
  })

  it('checks if email is not already in use', async () => {
    const findByEmailSpy = vi.spyOn(inMemoryUsersRepository, 'findByEmail')
    await sut.execute(request)
    expect(findByEmailSpy).toHaveBeenCalledWith(request.email)
  })

  it('sends a new email verification token if user exists but email was not verified yet', async () => {
    const user = new User(request)
    await inMemoryUsersRepository.create(user)
    const sendEmailVerificationTokenSpy = vi.spyOn(
      sendEmailVerificationToken,
      'execute',
    )

    const response = await sut.execute(request)

    expect(response.isRight()).toBe(true)
    expect(sendEmailVerificationTokenSpy).toHaveBeenCalledWith({ user })
  })

  it('returns an error if user already exists and email was verified', async () => {
    const user = new User({ ...request, emailVerifiedAt: new Date() })
    await inMemoryUsersRepository.create(user)

    const response = await sut.execute(request)

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserAlreadyExistsError)
  })

  it('creates a new user if email is not already in use', async () => {
    const createSpy = vi.spyOn(inMemoryUsersRepository, 'create')
    const response = await sut.execute(request)
    expect(response.isRight()).toBe(true)
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        emailVerifiedAt: null,
        createdAt: expect.any(Date),
        ...request,
      }),
    )
  })

  it('sends an email verification token to verify the user email', async () => {
    const sendEmailVerificationTokenSpy = vi.spyOn(
      sendEmailVerificationToken,
      'execute',
    )
    const response = await sut.execute(request)
    expect(response.isRight()).toBe(true)
    expect(sendEmailVerificationTokenSpy).toHaveBeenCalledWith({
      user: expect.objectContaining({
        id: expect.any(UniqueEntityId),
        email: request.email,
      }),
    })
  })
})
