import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Logger } from '@/core/protocols/logger'
import { InMemoryConfirmationTokensRepository } from '@/test/repositories/in-memory-confirmation-tokens-repository'

import type { SendAuthenticationTokenRequest } from './send-authentication-token'
import {
  EXPIRATION_TIME_IN_SECONDS,
  SendAuthenticationToken,
} from './send-authentication-token'
import type { EmailSender } from '../email/email-sender'
import { EmailTemplate } from '../email/email-template'
import { ConfirmationTokenType } from '../entities/confirmation-token'

describe('SendAuthenticationToken', () => {
  let sut: SendAuthenticationToken
  let confirmationTokensRepository: InMemoryConfirmationTokensRepository
  let emailSender: EmailSender
  let logger: Logger

  const request: SendAuthenticationTokenRequest = {
    user: {
      id: new UniqueEntityId(),
      email: 'daniel@example.com',
    },
  }

  beforeEach(() => {
    vi.useFakeTimers()

    confirmationTokensRepository = new InMemoryConfirmationTokensRepository()
    emailSender = { send: vi.fn() }
    logger = { debug: vi.fn() } as unknown as Logger
    sut = new SendAuthenticationToken(
      confirmationTokensRepository,
      emailSender,
      logger,
    )
  })

  afterEach(() => {
    vi.useRealTimers()
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

  it(`sends an "${ConfirmationTokenType.Authentication}" email`, async () => {
    const sendSpy = vi.spyOn(emailSender, 'send')
    await sut.execute(request)
    const [createdToken] = confirmationTokensRepository.items

    expect(createdToken).toBeTruthy()
    expect(createdToken).toMatchObject({
      type: ConfirmationTokenType.Authentication,
    })
    expect(sendSpy).toHaveBeenCalledWith({
      to: request.user.email,
      subject: expect.any(String),
      template: EmailTemplate.Authentication,
      data: { url: createdToken.url },
    })
  })
})
