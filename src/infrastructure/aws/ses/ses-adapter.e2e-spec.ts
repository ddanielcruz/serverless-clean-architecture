/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

import { config } from '@/core/config'
import type { SendEmailParams } from '@/domain/users/email/email-sender'
import { EmailTemplate } from '@/domain/users/email/email-template'

import { SESAdapter } from './ses-adapter'

vi.mock('@aws-sdk/client-ses', async (importActual) => {
  const module = await importActual()
  return {
    ...(module as Record<string, unknown>),
    SESClient: vi.fn().mockImplementation(() => {
      return {
        send: vi.fn(),
      }
    }),
  }
})

describe('SESAdapter', () => {
  let sut: SESAdapter
  let client: SESClient

  const params: SendEmailParams<EmailTemplate.EmailVerification> = {
    to: 'daniel@example.com',
    subject: 'Verify your email',
    template: EmailTemplate.EmailVerification,
    data: { url: 'https://serverless.com' },
  }

  beforeEach(() => {
    sut = new SESAdapter()

    // @ts-ignore
    client = sut.client
  })

  describe('send', () => {
    it('sends a SendEmailCommand with correct parameters', async () => {
      const sendSpy = vi.spyOn(client, 'send')
      await sut.send(params)

      expect(sendSpy).toHaveBeenCalled()
      const command = sendSpy.mock.calls[0][0] as SendEmailCommand
      expect(command.input.Source).toEqual(config.get('EMAIL_SENDER'))
      expect(command.input.Destination?.ToAddresses).toEqual([params.to])
      expect(command.input.Message?.Subject?.Data).toEqual(params.subject)
      expect(command.input.Message?.Body?.Html?.Data).toBeTypeOf('string')
    })

    it('sends an email to a list of destinations', async () => {
      const sendSpy = vi.spyOn(client, 'send')
      const to = ['destination.1@example.com', 'destination.2@example.com']
      await sut.send({ ...params, to })

      expect(sendSpy).toHaveBeenCalled()
      const command = sendSpy.mock.calls[0][0] as SendEmailCommand
      expect(command.input.Destination?.ToAddresses).toEqual(to)
    })

    it('renders the email template', async () => {
      const sendSpy = vi.spyOn(client, 'send')
      await sut.send(params)

      expect(sendSpy).toHaveBeenCalled()
      const command = sendSpy.mock.calls[0][0] as SendEmailCommand
      const htmlContent = command.input.Message?.Body?.Html?.Data
      assert(htmlContent)
      expect(htmlContent).toContain(params.data.url)
    })
  })
})
