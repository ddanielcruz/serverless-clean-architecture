import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeConfirmationToken } from '@/test/factories/confirmation-token-factory'
import { InMemoryConfirmationTokensRepository } from '@/test/repositories/in-memory-confirmation-tokens-repository'

import type { SendEmailVerificationTokenRequest } from './send-email-verification-token'
import {
  EXPIRATION_TIME_IN_SECONDS,
  SendEmailVerificationToken,
} from './send-email-verification-token'
import type { EmailSender } from '../email/email-sender'
import { ConfirmationTokenType } from '../entities/confirmation-token'

describe('SendEmailVerificationToken', () => {
  let sut: SendEmailVerificationToken
  let confirmationTokensRepository: InMemoryConfirmationTokensRepository
  let emailSender: EmailSender

  const request: SendEmailVerificationTokenRequest = {
    user: {
      id: new UniqueEntityId(),
      email: 'daniel@example.com',
    },
  }

  beforeEach(() => {
    vi.useFakeTimers()

    confirmationTokensRepository = new InMemoryConfirmationTokensRepository()
    emailSender = { send: vi.fn() }
    sut = new SendEmailVerificationToken(
      confirmationTokensRepository,
      emailSender,
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deletes all unused confirmation tokens', async () => {
    const deleteUserUnusedTokensSpy = vi.spyOn(
      confirmationTokensRepository,
      'deleteUserUnusedTokens',
    )
    await sut.execute(request)
    expect(deleteUserUnusedTokensSpy).toHaveBeenCalledWith(request.user.id)
  })

  it('creates a new token', async () => {
    const createSpy = vi.spyOn(confirmationTokensRepository, 'create')
    await sut.execute(request)
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(UniqueEntityId),
        userId: request.user.id,
        type: ConfirmationTokenType.EmailVerification,
        token: expect.any(String),
        expiresAt: expect.any(Date),
        usedAt: null,
        createdAt: expect.any(Date),
      }),
    )
  })

  it('generates an unique token string', async () => {
    await sut.execute(request)
    await confirmationTokensRepository.create(makeConfirmationToken())
    const [createdToken, mockedToken] = confirmationTokensRepository.items
    expect(createdToken.token).not.toBe(mockedToken.token)
  })

  it('defines an expiration date in the future based on the expiration time', async () => {
    const date = new Date(2024, 0, 1)
    vi.setSystemTime(date)
    const createSpy = vi.spyOn(confirmationTokensRepository, 'create')

    await sut.execute(request)

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        expiresAt: new Date(date.getTime() + EXPIRATION_TIME_IN_SECONDS * 1000),
      }),
    )
  })

  it('sends an email with the token URL', async () => {
    // const sendSpy = vi.spyOn(emailSender, 'send')
  })
})
