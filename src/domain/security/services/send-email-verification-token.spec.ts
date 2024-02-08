import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Logger } from '@/core/protocols/logger'
import { InMemoryConfirmationTokensRepository } from '@/test/repositories/in-memory-confirmation-tokens-repository'

import type { SendEmailVerificationTokenRequest } from './send-email-verification-token'
import { SendEmailVerificationToken } from './send-email-verification-token'
import type { EmailSender } from '../../users/email/email-sender'
import { EmailTemplate } from '../../users/email/email-template'
import { ConfirmationTokenType } from '../../users/entities/confirmation-token'

describe('SendEmailVerificationToken', () => {
  let sut: SendEmailVerificationToken
  let confirmationTokensRepository: InMemoryConfirmationTokensRepository
  let emailSender: EmailSender
  let logger: Logger

  const request: SendEmailVerificationTokenRequest = {
    user: {
      id: new UniqueEntityId(),
      email: 'daniel@example.com',
    },
  }

  beforeEach(() => {
    confirmationTokensRepository = new InMemoryConfirmationTokensRepository()
    emailSender = { send: vi.fn() }
    logger = { debug: vi.fn() } as unknown as Logger
    sut = new SendEmailVerificationToken(
      confirmationTokensRepository,
      emailSender,
      logger,
    )
  })

  it(`sends an "${ConfirmationTokenType.EmailVerification}" email`, async () => {
    const sendSpy = vi.spyOn(emailSender, 'send')
    await sut.execute(request)
    const [createdToken] = confirmationTokensRepository.items

    expect(createdToken).toBeTruthy()
    expect(createdToken).toMatchObject({
      type: ConfirmationTokenType.EmailVerification,
    })
    expect(sendSpy).toHaveBeenCalledWith({
      to: request.user.email,
      subject: expect.any(String),
      template: EmailTemplate.EmailVerification,
      data: { url: createdToken.url },
    })
  })
})
