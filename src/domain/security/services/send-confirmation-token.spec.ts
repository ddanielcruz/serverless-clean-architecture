import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Logger } from '@/core/protocols/logger'
import type { EmailSender } from '@/domain/users/email/email-sender'
import { EmailTemplate } from '@/domain/users/email/email-template'
import { ConfirmationTokenType } from '@/domain/users/entities/confirmation-token'
import { makeConfirmationToken } from '@/test/factories/confirmation-token-factory'
import { InMemoryConfirmationTokensRepository } from '@/test/repositories/in-memory-confirmation-tokens-repository'

import type { SendConfirmationTokenRequest } from './send-confirmation-token'
import { SendConfirmationToken } from './send-confirmation-token'

describe('SendConfirmationToken', () => {
  let sut: SendConfirmationToken
  let confirmationTokensRepository: InMemoryConfirmationTokensRepository
  let emailSender: EmailSender
  let logger: Logger

  const request: SendConfirmationTokenRequest = {
    user: {
      id: new UniqueEntityId(),
      email: 'daniel@example.com',
    },
    token: {
      type: ConfirmationTokenType.Authentication,
      expiresAt: new Date(),
    },
  }

  beforeEach(() => {
    confirmationTokensRepository = new InMemoryConfirmationTokensRepository()
    emailSender = { send: vi.fn() }
    logger = { debug: vi.fn() } as unknown as Logger
    sut = new SendConfirmationToken(
      confirmationTokensRepository,
      emailSender,
      logger,
    )
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
        type: request.token.type,
        token: expect.any(String),
        expiresAt: request.token.expiresAt,
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

  it.each([
    [ConfirmationTokenType.Authentication, EmailTemplate.Authentication],
    [ConfirmationTokenType.EmailVerification, EmailTemplate.EmailVerification],
  ])(
    'sends an "%s" email with the token URL',
    async (tokenType, emailTemplate) => {
      const sendSpy = vi.spyOn(emailSender, 'send')
      await sut.execute({
        ...request,
        token: {
          ...request.token,
          type: tokenType,
        },
      })
      const [createdToken] = confirmationTokensRepository.items
      expect(sendSpy).toHaveBeenCalledWith({
        to: request.user.email,
        subject: expect.any(String),
        template: emailTemplate,
        data: { url: createdToken.url },
      })
    },
  )
})
